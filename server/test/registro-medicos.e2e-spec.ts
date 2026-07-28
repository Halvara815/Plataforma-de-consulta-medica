import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, login } from './utils/fixtures';
import { Usuario } from '../src/modules/auth/entities/usuario.entity';

describe('Registro y administración de médicos (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  it('registra médicos como pendientes y permite al gestor activar su acceso', async () => {
    await createRoleWithPermissions(dataSource, 'MEDICO', ['pacientes:leer']);
    const registration = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        nombre: 'Dra. Registro',
        email: 'registro.medico@example.test',
        password: 'ClaveRegistro123!',
        especialidad: 'Medicina Interna',
        cedula: 'REG-001',
        consultorio: 'Consultorio 4',
      })
      .expect(201);

    expect(registration.body).toEqual(expect.objectContaining({
      email: 'registro.medico@example.test',
      estado: 'pendiente',
      medico: expect.objectContaining({ estado: 'pendiente', cedula: 'REG-001' }),
    }));

    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'registro.medico@example.test', password: 'ClaveRegistro123!' })
      .expect(401);

    const gestorRole = await createRoleWithPermissions(dataSource, 'GESTOR', ['usuarios:gestionar']);
    const gestor = await createUsuario(dataSource, { rol: gestorRole });
    const gestorToken = await login(app, gestor.email, gestor.password);

    await request(app.getHttpServer())
      .patch(`/api/v1/medicos/${registration.body.medico.id}`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ estado: 'activo' })
      .expect(200);

    const user = await dataSource.getRepository(Usuario).findOneByOrFail({
      email: 'registro.medico@example.test',
    });
    expect(user.estado).toBe('activo');

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'registro.medico@example.test', password: 'ClaveRegistro123!' })
      .expect(200);
    expect(loginResponse.body.user.roles).toContain('MEDICO');
  });

  it('rechaza datos de rol en el registro público y evita correos o cédulas duplicados', async () => {
    await createRoleWithPermissions(dataSource, 'MEDICO', []);
    const payload = {
      nombre: 'Dr. Duplicado',
      email: 'duplicado@example.test',
      password: 'ClaveRegistro123!',
      especialidad: 'Pediatría',
      cedula: 'REG-002',
    };

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ ...payload, roleNames: ['ADMIN'] })
      .expect(400);
    await request(app.getHttpServer()).post('/api/v1/auth/register').send(payload).expect(201);
    await request(app.getHttpServer()).post('/api/v1/auth/register').send(payload).expect(409);
  });

  it('solo permite una cuenta administradora', async () => {
    const gestorRole = await createRoleWithPermissions(dataSource, 'GESTOR', ['usuarios:gestionar']);
    const adminRole = await createRoleWithPermissions(dataSource, 'ADMIN', ['usuarios:gestionar']);
    const gestor = await createUsuario(dataSource, { rol: gestorRole });
    const token = await login(app, gestor.email, gestor.password);

    await request(app.getHttpServer())
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Administradora Única',
        email: 'admin.unica@example.test',
        password: 'ClaveAdminSegura123!',
        roleNames: [adminRole.nombre],
      })
      .expect(201);

    const duplicate = await request(app.getHttpServer())
      .post('/api/v1/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Segunda Administradora',
        email: 'admin.segunda@example.test',
        password: 'ClaveAdminSegura123!',
        roleNames: [adminRole.nombre],
      })
      .expect(400);
    expect(duplicate.body.message).toBe('Solo puede existir una cuenta administradora');
  });
});
