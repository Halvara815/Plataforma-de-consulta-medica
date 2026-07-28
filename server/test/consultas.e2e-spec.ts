import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createMedico, createPaciente, login } from './utils/fixtures';

describe('Consultas (e2e)', () => {
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
    const rol = await createRoleWithPermissions(dataSource, nombreRol, ['consultas:leer', 'consultas:escribir']);
    const medico = await createMedico(dataSource);
    const { email, password } = await createUsuario(dataSource, { rol, medicoId: medico.id });
    const token = await login(app, email, password);
    return { medico, token };
  }

  it('crea una consulta valida', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource);

    const response = await request(app.getHttpServer())
      .post('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: new Date().toISOString(),
        tipo: 'seguimiento',
        motivoConsulta: 'Control de rutina',
      })
      .expect(201);

    expect(response.body.estado).toBe('en_curso');
  });

  it('rechaza una consulta con paciente inactivo con 400', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource, { estado: 'inactivo' });

    await request(app.getHttpServer())
      .post('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: new Date().toISOString(),
        tipo: 'seguimiento',
      })
      .expect(400);
  });

  it('rechaza crear una consulta a nombre de otro medico con 403', async () => {
    const { token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    await request(app.getHttpServer())
      .post('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: otro.medico.id,
        fecha: new Date().toISOString(),
        tipo: 'seguimiento',
      })
      .expect(403);
  });

  it('rechaza que otro medico modifique la consulta con 403', async () => {
    const { medico, token } = await medicoConToken('MEDICO_A');
    const otro = await medicoConToken('MEDICO_B');
    const paciente = await createPaciente(dataSource);

    const created = await request(app.getHttpServer())
      .post('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: new Date().toISOString(),
        tipo: 'seguimiento',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/consultas/${created.body.id}`)
      .set('Authorization', `Bearer ${otro.token}`)
      .send({ notas: 'intento ajeno' })
      .expect(403);
  });

  it('cierra una consulta transaccionalmente y bloquea ediciones posteriores', async () => {
    const { medico, token } = await medicoConToken();
    const paciente = await createPaciente(dataSource);

    const created = await request(app.getHttpServer())
      .post('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: new Date().toISOString(),
        tipo: 'seguimiento',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/consultas/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'completada' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/consultas/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notas: 'ya no debería poder editar' })
      .expect(400);
  });

  it('rechaza listar consultas sin pacienteId con 400', async () => {
    const { token } = await medicoConToken();

    await request(app.getHttpServer())
      .get('/api/v1/consultas')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
