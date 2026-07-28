import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createMedico, login } from './utils/fixtures';

describe('Medicos (e2e)', () => {
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

  it('lista el directorio de medicos a cualquier usuario autenticado', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'SIN_PERMISOS', []);
    const { email, password } = await createUsuario(dataSource, { rol });
    await createMedico(dataSource, { nombre: 'Dra. Uno' });
    await createMedico(dataSource, { nombre: 'Dr. Dos' });
    const token = await login(app, email, password);

    const response = await request(app.getHttpServer())
      .get('/api/v1/medicos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveLength(2);
  });

  it('obtiene un medico por ID', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'SIN_PERMISOS', []);
    const { email, password } = await createUsuario(dataSource, { rol });
    const medico = await createMedico(dataSource, { nombre: 'Dra. Tres' });
    const token = await login(app, email, password);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/medicos/${medico.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.nombre).toBe('Dra. Tres');
  });

  it('rechaza el acceso sin token con 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/medicos').expect(401);
  });
});
