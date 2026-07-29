import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { Documento } from '../src/modules/documentos/entities/documento.entity';
import { createPaciente, createRoleWithPermissions, createUsuario, login } from './utils/fixtures';
import { createTestApp, resetDatabase } from './utils/test-app';

describe('Documentos seguros (e2e)', () => {
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

  async function tokenConPermisos(permisos = ['documentos:leer', 'documentos:escribir']): Promise<string> {
    const rol = await createRoleWithPermissions(dataSource, 'GESTOR_DOCUMENTOS', permisos);
    const { email, password } = await createUsuario(dataSource, { rol });
    return login(app, email, password);
  }

  it('carga, lista, descarga y da de baja lógica un documento validado', async () => {
    const paciente = await createPaciente(dataSource);
    const token = await tokenConPermisos();
    const pdf = Buffer.from('%PDF-1.4\nDocumento de prueba\n%%EOF');

    const created = await request(app.getHttpServer())
      .post('/api/v1/documentos')
      .set('Authorization', `Bearer ${token}`)
      .field('pacienteId', paciente.id)
      .field('categoria', 'Informe médico')
      .field('tags', 'control, laboratorio')
      .attach('file', pdf, { filename: 'informe-prueba.pdf', contentType: 'application/pdf' })
      .expect(201);

    expect(created.body).toEqual(expect.objectContaining({
      pacienteId: paciente.id,
      nombre: 'informe-prueba.pdf',
      mimeType: 'application/pdf',
      sizeBytes: pdf.length,
      estado: 'activo',
      scanStatus: 'no_configurado',
    }));
    expect(created.body.storageKey).toBeUndefined();

    const signedLink = await request(app.getHttpServer())
      .post(`/api/v1/documentos/${created.body.id}/enlace-descarga`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);
    expect(signedLink.body.url).toContain('/api/v1/documentos/descarga-firmada?token=');

    const signedDownload = await request(app.getHttpServer())
      .get(signedLink.body.url)
      .expect('Content-Type', /application\/pdf/)
      .expect(200);
    expect(signedDownload.body).toEqual(pdf);

    const listed = await request(app.getHttpServer())
      .get(`/api/v1/documentos?pacienteId=${paciente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body).toHaveLength(1);

    const downloaded = await request(app.getHttpServer())
      .get(`/api/v1/documentos/${created.body.id}/download`)
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /application\/pdf/)
      .expect(200);
    expect(downloaded.body).toEqual(pdf);

    await request(app.getHttpServer())
      .patch(`/api/v1/documentos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ categoria: 'Laboratorio', tags: ['resultado'] })
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/v1/documentos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const stored = await dataSource.getRepository(Documento).findOneByOrFail({ id: created.body.id });
    expect(stored.estado).toBe('eliminado');
    await request(app.getHttpServer())
      .get(`/api/v1/documentos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    const archived = await request(app.getHttpServer())
      .get(`/api/v1/documentos?pacienteId=${paciente.id}&estado=eliminado`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(archived.body).toHaveLength(1);
    expect(archived.body[0]).toEqual(expect.objectContaining({ id: created.body.id, estado: 'eliminado' }));

    await request(app.getHttpServer())
      .patch(`/api/v1/documentos/${created.body.id}/restaurar`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(200);
    await request(app.getHttpServer())
      .get(`/api/v1/documentos/${created.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const activeAfterRestore = await request(app.getHttpServer())
      .get(`/api/v1/documentos?pacienteId=${paciente.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(activeAfterRestore.body).toHaveLength(1);
  });

  it('rechaza archivos no permitidos y acceso sin sesión', async () => {
    const paciente = await createPaciente(dataSource);
    await request(app.getHttpServer())
      .get(`/api/v1/documentos?pacienteId=${paciente.id}`)
      .expect(401);

    const token = await tokenConPermisos();
    await request(app.getHttpServer())
      .post('/api/v1/documentos')
      .set('Authorization', `Bearer ${token}`)
      .field('pacienteId', paciente.id)
      .field('categoria', 'Otro')
      .attach('file', Buffer.from('MZ'), { filename: 'archivo.exe', contentType: 'application/octet-stream' })
      .expect(400);
  });
});
