import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createMedico, createPaciente, login } from './utils/fixtures';

describe('Estudios (e2e)', () => {
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
    const rol = await createRoleWithPermissions(dataSource, nombreRol, ['estudios:leer', 'estudios:escribir']);
    const medico = await createMedico(dataSource);
    const { email, password } = await createUsuario(dataSource, { rol, medicoId: medico.id });
    const token = await login(app, email, password);
    return { medico, token };
  }

  function crearEstudio(token: string, pacienteId: string, medicoId: string) {
    return request(app.getHttpServer())
      .post('/api/v1/estudios')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId,
        medicoId,
        fecha: '2026-08-01',
        tipoEstudio: 'laboratorio',
        estudiosSolicitados: ['Biometría hemática'],
      });
  }

  it('crea un estudio valido', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource);

    const response = await crearEstudio(token, paciente.id, medico.id).expect(201);
    expect(response.body.estado).toBe('solicitado');
  });

  it('rechaza un estudio con paciente inactivo con 400', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource, { estado: 'inactivo' });

    await crearEstudio(token, paciente.id, medico.id).expect(400);
  });

  it('rechaza solicitar un estudio a nombre de otro medico con 403', async () => {
    const { token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    await crearEstudio(token, paciente.id, otro.medico.id).expect(403);
  });

  it('rechaza que otro medico modifique el estudio con 403', async () => {
    const { medico, token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    const created = await crearEstudio(token, paciente.id, medico.id).expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/estudios/${created.body.id}`)
      .set('Authorization', `Bearer ${otro.token}`)
      .send({ notas: 'intento ajeno' })
      .expect(403);
  });

  it('rechaza listar estudios sin pacienteId con 400', async () => {
    const { token } = await medicoConToken();

    await request(app.getHttpServer())
      .get('/api/v1/estudios')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
