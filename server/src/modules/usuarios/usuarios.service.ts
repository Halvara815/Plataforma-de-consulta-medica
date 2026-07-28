import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { hashPassword } from '../auth/password-hash';
import { Rol } from '../auth/entities/rol.entity';
import { Sesion } from '../auth/entities/sesion.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolesRepository: Repository<Rol>,
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
    @InjectRepository(Sesion)
    private readonly sesionesRepository: Repository<Sesion>,
  ) {}

  async list(): Promise<Record<string, unknown>[]> {
    const usuarios = await this.userQuery().orderBy('usuario.nombre', 'ASC').getMany();
    return usuarios.map((usuario) => this.serialize(usuario));
  }

  async listRoles(): Promise<Record<string, unknown>[]> {
    const roles = await this.rolesRepository.find({ relations: ['permisos'], order: { nombre: 'ASC' } });
    return roles.map((rol) => ({
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos.map((permiso) => permiso.clave).sort(),
    }));
  }

  async create(dto: CreateUsuarioDto): Promise<Record<string, unknown>> {
    const email = dto.email.trim().toLowerCase();
    if (await this.usuariosRepository.exist({ where: { email } })) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const roles = await this.resolveRoles(dto.roleNames);
    await this.ensureSingleAdminRole(roles);
    const medicoId = await this.resolveMedico(dto.medicoId);
    const usuario = this.usuariosRepository.create({
      email,
      nombre: dto.nombre.trim(),
      passwordHash: await hashPassword(dto.password),
      estado: 'activo',
      medicoId,
      roles,
    });
    await this.usuariosRepository.save(usuario);
    return this.getById(usuario.id);
  }

  async update(id: string, dto: UpdateUsuarioDto): Promise<Record<string, unknown>> {
    const usuario = await this.userQuery().where('usuario.id = :id', { id }).getOne();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const roles = dto.roleNames ? await this.resolveRoles(dto.roleNames) : usuario.roles;
    const estado = dto.estado ?? usuario.estado;
    await this.ensureSingleAdminRole(roles, usuario.id);
    await this.ensureAdminRemainsAvailable(usuario, roles, estado);

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      if (email !== usuario.email && await this.usuariosRepository.exist({ where: { email } })) {
        throw new ConflictException('Ya existe un usuario con ese correo');
      }
      usuario.email = email;
    }
    if (dto.nombre !== undefined) usuario.nombre = dto.nombre.trim();
    if (dto.password) usuario.passwordHash = await hashPassword(dto.password);
    if (dto.estado) usuario.estado = dto.estado;
    if (dto.roleNames) usuario.roles = roles;
    if (dto.medicoId !== undefined) usuario.medicoId = await this.resolveMedico(dto.medicoId, usuario.id);

    await this.usuariosRepository.save(usuario);
    if (dto.password || dto.estado === 'inactivo') {
      await this.sesionesRepository.update({ usuarioId: usuario.id, revokedAt: IsNull() }, { revokedAt: new Date() });
    }
    return this.getById(usuario.id);
  }

  private async getById(id: string): Promise<Record<string, unknown>> {
    const usuario = await this.userQuery().where('usuario.id = :id', { id }).getOne();
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return this.serialize(usuario);
  }

  private userQuery() {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .leftJoinAndSelect('roles.permisos', 'permisos')
      .leftJoinAndSelect('usuario.medico', 'medico');
  }

  private async resolveRoles(roleNames: string[]): Promise<Rol[]> {
    const names = [...new Set(roleNames.map((role) => role.trim().toUpperCase()))];
    const roles = await this.rolesRepository.find({ where: { nombre: In(names) }, relations: ['permisos'] });
    if (roles.length !== names.length) throw new BadRequestException('Uno o más roles no existen');
    return roles;
  }

  private async resolveMedico(medicoId: string | null | undefined, currentUserId?: string): Promise<string | null> {
    if (medicoId === null || medicoId === undefined) return null;
    if (!await this.medicosRepository.exist({ where: { id: medicoId } })) {
      throw new BadRequestException('El médico seleccionado no existe');
    }
    const assignedUser = await this.usuariosRepository.findOneBy({ medicoId });
    if (assignedUser && assignedUser.id !== currentUserId) {
      throw new ConflictException('El médico ya está asociado a otro usuario');
    }
    return medicoId;
  }

  private async ensureAdminRemainsAvailable(usuario: Usuario, roles: Rol[], estado: string): Promise<void> {
    const wasAdmin = usuario.roles.some((rol) => rol.nombre === 'ADMIN');
    const remainsAdmin = roles.some((rol) => rol.nombre === 'ADMIN') && estado === 'activo';
    if (!wasAdmin || remainsAdmin) return;

    const activeAdmins = await this.usuariosRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.roles', 'rol', 'rol.nombre = :adminRole', { adminRole: 'ADMIN' })
      .where('usuario.estado = :state', { state: 'activo' })
      .getCount();
    if (activeAdmins <= 1) {
      throw new BadRequestException('Debe permanecer al menos un administrador activo');
    }
  }

  private async ensureSingleAdminRole(roles: Rol[], currentUserId?: string): Promise<void> {
    if (!roles.some((rol) => rol.nombre === 'ADMIN')) return;

    const query = this.usuariosRepository
      .createQueryBuilder('usuario')
      .innerJoin('usuario.roles', 'rol', 'rol.nombre = :adminRole', { adminRole: 'ADMIN' });
    if (currentUserId) query.where('usuario.id <> :currentUserId', { currentUserId });

    if (await query.getCount() > 0) {
      throw new BadRequestException('Solo puede existir una cuenta administradora');
    }
  }

  private serialize(usuario: Usuario): Record<string, unknown> {
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      estado: usuario.estado,
      medico: usuario.medico ? {
        id: usuario.medico.id,
        nombre: usuario.medico.nombre,
        especialidad: usuario.medico.especialidad,
        cedula: usuario.medico.cedula,
      } : null,
      roles: usuario.roles.map((rol) => ({
        id: rol.id,
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos.map((permiso) => permiso.clave).sort(),
      })),
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
    };
  }
}
