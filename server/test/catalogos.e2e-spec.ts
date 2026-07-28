import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, login } from './utils/fixtures';

describe('Catálogos clínicos (e2e)', () => {
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

  async function tokenConPermisos(permisos: string[], roleName: string) {
    const rol = await createRoleWithPermissions(dataSource, roleName, permisos);
    const { email, password } = await createUsuario(dataSource, { rol });
    return login(app, email, password);
  }

  it('expone los catálogos activos únicamente a quien puede leerlos', async () => {
    const sinPermiso = await tokenConPermisos(['pacientes:leer'], 'SIN_CATALOGOS');
    await request(app.getHttpServer())
      .get('/api/v1/catalogos')
      .set('Authorization', `Bearer ${sinPermiso}`)
      .expect(403);

    const lector = await tokenConPermisos(['catalogos:leer'], 'LECTOR_CATALOGOS');
    const response = await request(app.getHttpServer())
      .get('/api/v1/catalogos')
      .set('Authorization', `Bearer ${lector}`)
      .expect(200);
    expect(response.body.diagnosticosCIE10).toEqual(expect.arrayContaining([
      expect.objectContaining({ codigo: 'I10' }),
    ]));
  });

  it('permite administrar entradas sin exponer las inactivas al cliente clínico', async () => {
    const gestor = await tokenConPermisos(['catalogos:leer', 'catalogos:gestionar'], 'GESTOR_CATALOGOS');
    const codigo = `MED-PRUEBA-${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/catalogos/entradas')
      .set('Authorization', `Bearer ${gestor}`)
      .send({
        tipo: 'medicamentos',
        codigo,
        nombre: 'Medicamento de prueba',
        metadata: { presentaciones: ['10 mg'] },
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/catalogos/entradas/${created.body.id}`)
      .set('Authorization', `Bearer ${gestor}`)
      .send({ estado: 'inactivo' })
      .expect(200);

    const visible = await request(app.getHttpServer())
      .get('/api/v1/catalogos/medicamentos')
      .set('Authorization', `Bearer ${gestor}`)
      .expect(200);
    expect(visible.body).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ nombre: 'Medicamento de prueba' }),
    ]));
  });
});
