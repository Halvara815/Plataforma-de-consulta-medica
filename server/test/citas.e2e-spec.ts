import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createTestApp, resetDatabase } from './utils/test-app';
import { createRoleWithPermissions, createUsuario, createMedico, createPaciente, login } from './utils/fixtures';

describe('Citas (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDatabase(app);
    const rol = await createRoleWithPermissions(dataSource, 'AGENDA', ['citas:leer', 'citas:escribir']);
    const { email, password } = await createUsuario(dataSource, { rol });
    token = await login(app, email, password);
  });

  it('crea una cita válida', async () => {
    const medico = await createMedico(dataSource);
    const paciente = await createPaciente(dataSource);

    const response = await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: '2026-08-10',
        horaInicio: '09:00',
        horaFin: '09:30',
        motivo: 'Consulta de prueba',
      })
      .expect(201);

    expect(response.body.estado).toBe('pendiente');
    expect(response.body.medicoId).toBe(medico.id);
  });

  it('rechaza un solape de horario del mismo médico con 409', async () => {
    const medico = await createMedico(dataSource);
    const paciente = await createPaciente(dataSource);
    const payload = {
      pacienteId: paciente.id,
      medicoId: medico.id,
      fecha: '2026-08-10',
      horaInicio: '09:00',
      horaFin: '09:30',
    };

    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...payload, horaInicio: '09:15', horaFin: '09:45' })
      .expect(409);
  });

  it('rechaza una cita con médico inactivo con 400', async () => {
    const medico = await createMedico(dataSource, { estado: 'inactivo' });
    const paciente = await createPaciente(dataSource);

    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: '2026-08-10',
        horaInicio: '09:00',
        horaFin: '09:30',
      })
      .expect(400);
  });

  it('rechaza una transición de estado inválida con 400 y acepta una válida', async () => {
    const medico = await createMedico(dataSource);
    const paciente = await createPaciente(dataSource);

    const created = await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pacienteId: paciente.id,
        medicoId: medico.id,
        fecha: '2026-08-10',
        horaInicio: '09:00',
        horaFin: '09:30',
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/api/v1/citas/${created.body.id}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'completada' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(`/api/v1/citas/${created.body.id}/estado`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'confirmada' })
      .expect(200);
  });

  it('filtra y pagina citas por médico y fecha', async () => {
    const medico = await createMedico(dataSource);
    const otroMedico = await createMedico(dataSource);
    const paciente = await createPaciente(dataSource);

    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ pacienteId: paciente.id, medicoId: medico.id, fecha: '2026-08-10', horaInicio: '09:00', horaFin: '09:30' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ pacienteId: paciente.id, medicoId: otroMedico.id, fecha: '2026-08-10', horaInicio: '10:00', horaFin: '10:30' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/v1/citas')
      .set('Authorization', `Bearer ${token}`)
      .send({ pacienteId: paciente.id, medicoId: medico.id, fecha: '2026-08-11', horaInicio: '09:00', horaFin: '09:30' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get(`/api/v1/citas?medicoId=${medico.id}&fecha=2026-08-10`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].medicoId).toBe(medico.id);
    expect(response.body.pagination.total).toBe(1);
  });
});
