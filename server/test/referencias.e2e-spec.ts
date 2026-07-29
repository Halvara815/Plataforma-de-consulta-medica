import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createPaciente, createRoleWithPermissions, createUsuario, login } from './utils/fixtures';
import { createTestApp, resetDatabase } from './utils/test-app';

describe('Referencias clínicas (e2e)', () => {
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

  it('persiste una referencia y la devuelve al consultar el expediente', async () => {
    const paciente = await createPaciente(dataSource);
    const rol = await createRoleWithPermissions(dataSource, 'GESTOR_REFERENCIAS', ['pacientes:leer', 'pacientes:escribir']);
    const { email, password } = await createUsuario(dataSource, { rol });
    const token = await login(app, email, password);

    const created = await request(app.getHttpServer())
      .post('/api/v1/referencias')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        especialidad: 'Cardiología',
        medicoDestino: 'Hospital Central',
        fecha: '2026-07-29',
        estado: 'pendiente',
        motivo: 'Valoración por dolor torácico.',
      })
      .expect(201);
    expect(created.body).toEqual(expect.objectContaining({ pacienteId: paciente.id, estado: 'pendiente' }));

    const listed = await request(app.getHttpServer())
      .get(`/api/v1/referencias?pacienteId=${paciente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body).toHaveLength(1);
    expect(listed.body[0]).toEqual(expect.objectContaining({ id: created.body.id, motivo: 'Valoración por dolor torácico.' }));
  });

  it('rechaza referencias sin permiso de escritura', async () => {
    const paciente = await createPaciente(dataSource);
    const rol = await createRoleWithPermissions(dataSource, 'LECTOR_REFERENCIAS', ['pacientes:leer']);
    const { email, password } = await createUsuario(dataSource, { rol });
    const token = await login(app, email, password);

    await request(app.getHttpServer())
      .post('/api/v1/referencias')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        especialidad: 'Cardiología',
        medicoDestino: 'Hospital Central',
        fecha: '2026-07-29',
        motivo: 'Valoración clínica.',
      })
      .expect(403);
  });
});
