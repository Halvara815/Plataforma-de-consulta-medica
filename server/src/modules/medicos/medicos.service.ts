import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { Usuario } from '../auth/entities/usuario.entity';
import { Sesion } from '../auth/entities/sesion.entity';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionesRepository: Repository<Sesion>,
  ) {}

  async findAll(includeInactive = false): Promise<Medico[]> {
    return this.medicosRepository.find({
      where: includeInactive ? {} : { estado: 'activo' },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: string, includeInactive = false): Promise<Medico> {
    const medico = await this.medicosRepository.findOneBy(includeInactive ? { id } : { id, estado: 'activo' });
    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }
    return medico;
  }

  async updateByAdmin(id: string, dto: UpdateMedicoDto): Promise<Medico> {
    const medico = await this.findOne(id, true);
    if (dto.cedula !== undefined) {
      const cedula = dto.cedula.trim();
      const existente = await this.medicosRepository.findOneBy({ cedula });
      if (existente && existente.id !== medico.id) {
        throw new ConflictException('Ya existe un médico registrado con esa cédula');
      }
      medico.cedula = cedula;
    }
    if (dto.nombre !== undefined) medico.nombre = dto.nombre.trim();
    if (dto.especialidad !== undefined) medico.especialidad = dto.especialidad.trim();
    if (dto.consultorio !== undefined) medico.consultorio = dto.consultorio?.trim() || null;
    if (dto.firma !== undefined) medico.firma = dto.firma?.trim() || null;
    if (dto.estado !== undefined) medico.estado = dto.estado;

    await this.medicosRepository.save(medico);

    const usuario = await this.usuariosRepository.findOneBy({ medicoId: medico.id });
    if (usuario) {
      if (dto.nombre !== undefined) usuario.nombre = medico.nombre;
      if (dto.estado !== undefined) {
        usuario.estado = dto.estado;
        if (dto.estado !== 'activo') {
          await this.sesionesRepository.update({ usuarioId: usuario.id, revokedAt: IsNull() }, { revokedAt: new Date() });
        }
      }
      await this.usuariosRepository.save(usuario);
    }

    return medico;
  }
}
