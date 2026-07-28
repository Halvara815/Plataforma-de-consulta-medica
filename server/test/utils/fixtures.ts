import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Medico } from '../../src/modules/medicos/entities/medico.entity';
import { Paciente } from '../../src/modules/pacientes/entities/paciente.entity';
import { Permiso } from '../../src/modules/auth/entities/permiso.entity';
import { Rol } from '../../src/modules/auth/entities/rol.entity';
import { Usuario } from '../../src/modules/auth/entities/usuario.entity';
import { hashPassword } from '../../src/modules/auth/password-hash';

let sequence = 0;
function unique(prefix: string): string {
  sequence += 1;
  return `${prefix}${sequence}`;
}

export async function createRoleWithPermissions(
  dataSource: DataSource,
  nombre: string,
  permisosClaves: string[],
): Promise<Rol> {
  const permisosRepo = dataSource.getRepository(Permiso);
  const rolesRepo = dataSource.getRepository(Rol);

  const permisos: Permiso[] = [];
  for (const clave of permisosClaves) {
    let permiso = await permisosRepo.findOneBy({ clave });
    if (!permiso) {
      permiso = await permisosRepo.save(permisosRepo.create({ clave, descripcion: clave }));
    }
    permisos.push(permiso);
  }

  return rolesRepo.save(rolesRepo.create({ nombre, descripcion: nombre, permisos }));
}

export async function createUsuario(
  dataSource: DataSource,
  options: { rol: Rol; email?: string; password?: string; medicoId?: string | null },
): Promise<{ email: string; password: string; usuario: Usuario }> {
  const email = options.email ?? `${unique('usuario')}@example.test`;
  const password = options.password ?? 'ClaveSegura123!';
  const usuariosRepo = dataSource.getRepository(Usuario);

  const usuario = await usuariosRepo.save(usuariosRepo.create({
    email,
    passwordHash: await hashPassword(password),
    nombre: 'Usuario de prueba',
    estado: 'activo',
    medicoId: options.medicoId ?? null,
    roles: [options.rol],
  }));

  return { email, password, usuario };
}

export async function createMedico(dataSource: DataSource, overrides: Partial<Medico> = {}): Promise<Medico> {
  const medicosRepo = dataSource.getRepository(Medico);
  return medicosRepo.save(medicosRepo.create({
    nombre: 'Dr. Prueba',
    especialidad: 'Medicina General',
    cedula: unique('CEDULA-'),
    consultorio: 'Consultorio de prueba',
    estado: 'activo',
    ...overrides,
  }));
}

export async function createPaciente(dataSource: DataSource, overrides: Partial<Paciente> = {}): Promise<Paciente> {
  const pacientesRepo = dataSource.getRepository(Paciente);
  return pacientesRepo.save(pacientesRepo.create({
    nombre: 'Paciente',
    apellidos: 'De Prueba',
    fechaNacimiento: '1990-01-01',
    sexo: 'femenino',
    estado: 'activo',
    ...overrides,
  }));
}

export async function login(app: INestApplication, email: string, password: string): Promise<string> {
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email, password })
    .expect(200);
  return response.body.accessToken;
}
