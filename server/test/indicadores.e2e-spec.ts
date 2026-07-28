import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Cita } from '../src/modules/citas/entities/cita.entity';
import { Consulta } from '../src/modules/consultas/entities/consulta.entity';
import { Estudio } from '../src/modules/estudios/entities/estudio.entity';
import { Receta } from '../src/modules/recetas/entities/receta.entity';
import { createMedico, createPaciente, createRoleWithPermissions, createUsuario, login } from './utils/fixtures';
import { createTestApp, resetDatabase } from './utils/test-app';

const PERMISOS_INDICADORES = ['pacientes:leer', 'citas:leer', 'consultas:leer', 'recetas:leer', 'estudios:leer'];

describe('Indicadores (e2e)', () => {
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

  async function tokenConIndicadores() {
    const rol = await createRoleWithPermissions(dataSource, 'CLINICO', PERMISOS_INDICADORES);
    const medico = await createMedico(dataSource, { nombre: 'Dra. Indicadores' });
    const { email, password } = await createUsuario(dataSource, { rol, medicoId: medico.id });
    return { medico, token: await login(app, email, password) };
  }

  async function crearDatosClinicos(medicoId: string) {
    const paciente = await createPaciente(dataSource, {
      alertas: [{ tipo: 'seguimiento', descripcion: 'Control requerido', activa: true }],
    });
    await dataSource.getRepository(Cita).save({
      pacienteId: paciente.id,
      medicoId,
      fecha: '2026-07-28',
      horaInicio: '09:00',
      horaFin: '09:30',
      estado: 'confirmada',
      motivo: 'Seguimiento',
    });
    await dataSource.getRepository(Consulta).save({
      pacienteId: paciente.id,
      medicoId,
      fecha: new Date('2026-07-28T10:00:00.000Z'),
      tipo: 'seguimiento',
      diagnosticos: [{ descripcion: 'Hipertensión' }],
      estado: 'completada',
    });
    await dataSource.getRepository(Receta).save({
      folio: 'TEST-IND-0001',
      pacienteId: paciente.id,
      medicoId,
      fecha: '2026-07-28',
      tipo: 'ambulatoria',
      estado: 'activa',
    });
    await dataSource.getRepository(Estudio).save({
      pacienteId: paciente.id,
      medicoId,
      fecha: '2026-07-28',
      tipoEstudio: 'laboratorio',
      estado: 'solicitado',
    });
  }

  it('devuelve el resumen del dashboard sin exponer colecciones clínicas completas', async () => {
    const { medico, token } = await tokenConIndicadores();
    await crearDatosClinicos(medico.id);

    const response = await request(app.getHttpServer())
      .get('/api/v1/indicadores/dashboard?fecha=2026-07-28')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.citas.total).toBe(1);
    expect(response.body.recetasEmitidas).toBe(1);
    expect(response.body.seguimientos.estudiosPendientes).toBe(1);
    expect(response.body.consultas.diagnosticosFrecuentes).toEqual([{ label: 'Hipertensión', value: 1 }]);
    expect(response.body).not.toHaveProperty('recetas.items');
    expect(response.body).not.toHaveProperty('consultas.items');
  });

  it('devuelve agregados para reportes y los protege con permisos clínicos', async () => {
    const { medico, token } = await tokenConIndicadores();
    await crearDatosClinicos(medico.id);

    const response = await request(app.getHttpServer())
      .get('/api/v1/indicadores/reportes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.totales).toMatchObject({ consultas: 1, recetas: 1, estudios: 1 });
    expect(response.body.consultasPorMedico).toEqual([{ label: 'Dra. Indicadores', value: 1 }]);

    const rolLimitado = await createRoleWithPermissions(dataSource, 'SOLO_PACIENTES', ['pacientes:leer']);
    const limitedUser = await createUsuario(dataSource, { rol: rolLimitado });
    const limitedToken = await login(app, limitedUser.email, limitedUser.password);
    await request(app.getHttpServer())
      .get('/api/v1/indicadores/reportes')
      .set('Authorization', `Bearer ${limitedToken}`)
      .expect(403);
  });
});
