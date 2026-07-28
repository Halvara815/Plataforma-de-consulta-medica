import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createMedico, createPaciente, login } from './utils/fixtures';

describe('Recetas (e2e)', () => {
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

  async function medicoConToken(nombreRol = 'MEDICO') {
    const rol = await createRoleWithPermissions(dataSource, nombreRol, ['recetas:leer', 'recetas:escribir']);
    const medico = await createMedico(dataSource);
    const { email, password } = await createUsuario(dataSource, { rol, medicoId: medico.id });
    const token = await login(app, email, password);
    return { medico, token };
  }

  function crearReceta(token: string, pacienteId: string, medicoId: string) {
    return request(app.getHttpServer())
      .post('/api/v1/recetas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId,
        medicoId,
        fecha: '2026-08-01',
        tipo: 'ambulatoria',
        vigenciaDias: 5,
        medicamentos: [{ nombre: 'Paracetamol', dosis: '1 tableta' }],
      });
  }

  it('asigna folios unicos generados por el servidor en creaciones consecutivas', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource);

    const primera = await crearReceta(token, paciente.id, medico.id).expect(201);
    const segunda = await crearReceta(token, paciente.id, medico.id).expect(201);

    expect(primera.body.folio).toBeTruthy();
    expect(segunda.body.folio).toBeTruthy();
    expect(primera.body.folio).not.toBe(segunda.body.folio);
  });

  it('rechaza una receta con paciente inactivo con 400', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource, { estado: 'inactivo' });

    await crearReceta(token, paciente.id, medico.id).expect(400);
  });

  it('rechaza una receta si el medico autenticado esta inactivo con 400', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource);
    await dataSource.getRepository('Medico').update(medico.id, { estado: 'inactivo' });

    await crearReceta(token, paciente.id, medico.id).expect(400);
  });

  it('rechaza prescribir a nombre de otro medico con 403', async () => {
    const { token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    await crearReceta(token, paciente.id, otro.medico.id).expect(403);
  });

  it('rechaza que otro medico modifique la receta con 403', async () => {
    const { medico, token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    const created = await crearReceta(token, paciente.id, medico.id).expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/recetas/${created.body.id}`)
      .set('Authorization', `Bearer ${otro.token}`)
      .send({ notasPaciente: 'intento ajeno' })
      .expect(403);
  });
});
