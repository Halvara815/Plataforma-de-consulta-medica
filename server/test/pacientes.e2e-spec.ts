import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createPaciente, login } from './utils/fixtures';

describe('Pacientes (e2e)', () => {
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

  it('devuelve un listado paginado de pacientes', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'LECTOR', ['pacientes:leer']);
    const { email, password } = await createUsuario(dataSource, { rol });
    for (let i = 0; i < 3; i += 1) {
      await createPaciente(dataSource, { nombre: `Paciente${i}`, apellidos: 'Demo' });
    }
    const token = await login(app, email, password);

    const response = await request(app.getHttpServer())
      .get('/api/v1/pacientes?page=1&limit=2')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toHaveLength(2);
    expect(response.body.pagination).toEqual({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it('rechaza un limit fuera de rango con 400', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'LECTOR', ['pacientes:leer']);
    const { email, password } = await createUsuario(dataSource, { rol });
    const token = await login(app, email, password);

    await request(app.getHttpServer())
      .get('/api/v1/pacientes?limit=101')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('busca pacientes por nombre, apellidos y CURP', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'LECTOR', ['pacientes:leer']);
    const { email, password } = await createUsuario(dataSource, { rol });
    await createPaciente(dataSource, { nombre: 'Ana', apellidos: 'García', curp: 'BUSCA000101MDFXXX01' });
    await createPaciente(dataSource, { nombre: 'Bruno', apellidos: 'Pérez', curp: 'OTRO000101HDFXXX02' });
    const token = await login(app, email, password);

    const porNombre = await request(app.getHttpServer())
      .get('/api/v1/pacientes?q=ana')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(porNombre.body.items).toHaveLength(1);
    expect(porNombre.body.items[0].nombre).toBe('Ana');

    const porCurp = await request(app.getHttpServer())
      .get('/api/v1/pacientes?q=BUSCA000101MDFXXX01')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(porCurp.body.items).toHaveLength(1);
    expect(porCurp.body.items[0].curp).toBe('BUSCA000101MDFXXX01');
  });

  it('filtra pacientes por estado', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'LECTOR', ['pacientes:leer']);
    const { email, password } = await createUsuario(dataSource, { rol });
    await createPaciente(dataSource, { nombre: 'Activo', estado: 'activo' });
    await createPaciente(dataSource, { nombre: 'Inactivo', estado: 'inactivo' });
    const token = await login(app, email, password);

    const response = await request(app.getHttpServer())
      .get('/api/v1/pacientes?estado=inactivo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].nombre).toBe('Inactivo');
  });

  it('rechaza el acceso sin token con 401', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/pacientes')
      .expect(401);
  });

  it('rechaza el acceso sin el permiso requerido con 403', async () => {
    const rol = await createRoleWithPermissions(dataSource, 'SIN_PERMISOS', []);
    const { email, password } = await createUsuario(dataSource, { rol });
    const token = await login(app, email, password);

    await request(app.getHttpServer())
      .get('/api/v1/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
