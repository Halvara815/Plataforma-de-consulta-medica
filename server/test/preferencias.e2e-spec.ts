import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { createRoleWithPermissions, createUsuario, login } from './utils/fixtures';
import { createTestApp, resetDatabase } from './utils/test-app';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLx9wAAAABJRU5ErkJggg==',
  'base64',
);

describe('Preferencias sincronizadas (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let roleSequence = 0;

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

  async function createSession(): Promise<string> {
    roleSequence += 1;
    const rol = await createRoleWithPermissions(dataSource, `USUARIO_PREFERENCIAS_${roleSequence}`, []);
    const { email, password } = await createUsuario(dataSource, { rol });
    return login(app, email, password);
  }

  it('crea preferencias privadas, las actualiza y restaura las herramientas', async () => {
    const token = await createSession();

    const initial = await request(app.getHttpServer())
      .get('/api/v1/preferencias')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(initial.body).toEqual(expect.objectContaining({
      tema: 'system',
      sonidoTemporizador: true,
      notas: [],
      recordatorios: [],
      favoritos: ['nuevo-paciente', 'agenda', 'reportes'],
    }));
    expect(initial.body.plantillas).toHaveLength(3);

    const updated = await request(app.getHttpServer())
      .patch('/api/v1/preferencias')
      .set('Authorization', `Bearer ${token}`)
      .send({
        tema: 'dark',
        sonidoTemporizador: false,
        notas: [{ id: 'nota-1', titulo: 'Pendientes', cuerpo: 'Llamar al laboratorio', fecha: '2026-07-29T10:00:00.000Z' }],
        recordatorios: [{ id: 'recordatorio-1', titulo: 'Seguimiento', fecha: '2026-07-30', done: false }],
        favoritos: ['agenda', 'documentos'],
      })
      .expect(200);
    expect(updated.body).toEqual(expect.objectContaining({ tema: 'dark', sonidoTemporizador: false }));
    expect(updated.body.notas).toHaveLength(1);
    expect(updated.body.recordatorios).toHaveLength(1);
    expect(updated.body.favoritos).toEqual(['agenda', 'documentos']);

    await request(app.getHttpServer())
      .patch('/api/v1/preferencias')
      .set('Authorization', `Bearer ${token}`)
      .send({ favoritos: ['no-permitido'] })
      .expect(400);

    const reset = await request(app.getHttpServer())
      .delete('/api/v1/preferencias/herramientas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(reset.body).toEqual(expect.objectContaining({
      sonidoTemporizador: true,
      notas: [],
      recordatorios: [],
      favoritos: ['nuevo-paciente', 'agenda', 'reportes'],
    }));
    expect(reset.body.plantillas).toHaveLength(3);
  });

  it('guarda firmas como archivos protegidos y evita el acceso de otro usuario', async () => {
    const token = await createSession();
    const created = await request(app.getHttpServer())
      .post('/api/v1/preferencias/firmas')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', PNG_1X1, { filename: 'firma-prueba.png', contentType: 'image/png' })
      .expect(201);

    expect(created.body).toEqual(expect.objectContaining({
      nombre: 'firma-prueba.png',
      mimeType: 'image/png',
      sizeBytes: PNG_1X1.length,
      scanStatus: 'no_configurado',
    }));
    expect(created.body.storageKey).toBeUndefined();

    const listed = await request(app.getHttpServer())
      .get('/api/v1/preferencias/firmas')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body).toHaveLength(1);

    const downloaded = await request(app.getHttpServer())
      .get(`/api/v1/preferencias/firmas/${created.body.id}/download`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /image\/png/)
      .expect(200);
    expect(downloaded.body).toEqual(PNG_1X1);

    const anotherToken = await createSession();
    await request(app.getHttpServer())
      .get(`/api/v1/preferencias/firmas/${created.body.id}/download`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/v1/preferencias/firmas/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
