import { MigrationInterface, QueryRunner } from 'typeorm';

type CatalogEntry = [tipo: string, codigo: string, nombre: string, metadata?: Record<string, unknown>];

export class ClinicalCatalogsAndContracts1785280000000 implements MigrationInterface {
  name = 'ClinicalCatalogsAndContracts1785280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "catalogos_clinicos" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "tipo" character varying NOT NULL,
        "codigo" character varying NOT NULL,
        "nombre" character varying NOT NULL,
        "metadata" jsonb,
        "estado" character varying NOT NULL DEFAULT 'activo',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_catalogos_clinicos" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_catalogos_clinicos_tipo_codigo" UNIQUE ("tipo", "codigo")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_catalogos_clinicos_tipo_estado" ON "catalogos_clinicos" ("tipo", "estado")`);

    const entries: CatalogEntry[] = [
      ['diagnosticosCIE10', 'I10', 'Hipertensión esencial (primaria)'],
      ['diagnosticosCIE10', 'E11', 'Diabetes mellitus tipo 2'],
      ['diagnosticosCIE10', 'J06.9', 'Infección aguda de las vías respiratorias superiores'],
      ['diagnosticosCIE10', 'K29.7', 'Gastritis, no especificada'],
      ['diagnosticosCIE10', 'E78.5', 'Dislipidemia, no especificada'],
      ['diagnosticosCIE10', 'M54.5', 'Dolor lumbar bajo'],
      ['diagnosticosCIE10', 'N39.0', 'Infección de vías urinarias, sitio no especificado'],
      ['diagnosticosCIE10', 'J45.9', 'Asma, no especificada'],
      ['diagnosticosCIE10', 'R51', 'Cefalea'],
      ['diagnosticosCIE10', 'Z34.9', 'Supervisión de embarazo normal, no especificado'],
      ['diagnosticosCIE10', 'M25.5', 'Dolor articular'],
      ['diagnosticosCIE10', 'E03.9', 'Hipotiroidismo, no especificado'],
      ['diagnosticosCIE10', 'F41.1', 'Trastorno de ansiedad generalizada'],
      ['diagnosticosCIE10', 'L20.9', 'Dermatitis atópica, no especificada'],
      ['diagnosticosCIE10', 'H52.4', 'Presbicia'],

      ['medicamentos', 'AMOXI-CLAV', 'Amoxicilina / Ácido clavulánico', { presentaciones: ['500 mg/125 mg', '875 mg/125 mg'] }],
      ['medicamentos', 'LORATADINA', 'Loratadina', { presentaciones: ['10 mg'] }],
      ['medicamentos', 'PARACETAMOL', 'Paracetamol', { presentaciones: ['500 mg', '1 g'] }],
      ['medicamentos', 'LOSARTAN', 'Losartán', { presentaciones: ['50 mg', '100 mg'] }],
      ['medicamentos', 'HIDROCLOROTIAZIDA', 'Hidroclorotiazida', { presentaciones: ['12.5 mg', '25 mg'] }],
      ['medicamentos', 'METFORMINA', 'Metformina', { presentaciones: ['500 mg', '850 mg', '1 g'] }],
      ['medicamentos', 'OMEPRAZOL', 'Omeprazol', { presentaciones: ['20 mg', '40 mg'] }],
      ['medicamentos', 'IBUPROFENO', 'Ibuprofeno', { presentaciones: ['400 mg', '600 mg'] }],
      ['medicamentos', 'ATORVASTATINA', 'Atorvastatina', { presentaciones: ['10 mg', '20 mg'] }],
      ['medicamentos', 'LEVOTIROXINA', 'Levotiroxina', { presentaciones: ['50 mcg', '100 mcg'] }],
      ['medicamentos', 'SALBUTAMOL', 'Salbutamol inhalado', { presentaciones: ['100 mcg/dosis'] }],
      ['medicamentos', 'ACIDO-FOLICO', 'Ácido fólico', { presentaciones: ['5 mg'] }],
      ['medicamentos', 'ACO', 'Anticonceptivo oral combinado', { presentaciones: ['21 tabletas'] }],
      ['medicamentos', 'DICLOFENACO', 'Diclofenaco', { presentaciones: ['50 mg', '75 mg inyectable'] }],
      ['medicamentos', 'CETIRIZINA', 'Cetirizina', { presentaciones: ['10 mg'] }],

      ['interaccionesConocidas', 'INT-001', 'Amoxicilina puede disminuir el efecto de anticonceptivos orales. Considere método adicional.', { medicamentos: ['Amoxicilina / Ácido clavulánico', 'Anticonceptivo oral combinado'], severidad: 'media' }],
      ['interaccionesConocidas', 'INT-002', 'El uso conjunto puede reducir el efecto antihipertensivo y afectar función renal.', { medicamentos: ['Ibuprofeno', 'Losartán'], severidad: 'media' }],
      ['interaccionesConocidas', 'INT-003', 'Riesgo de disminución del efecto diurético y daño renal con uso prolongado.', { medicamentos: ['Diclofenaco', 'Hidroclorotiazida'], severidad: 'alta' }],

      ['aseguradoras', 'FIDALIDAD', 'Fidalidad'],
      ['aseguradoras', 'FABISALUD', 'FabiSalud'],
      ['aseguradoras', 'ASEGURADORA-NACIONAL', 'Aseguradora Nacional'],
      ['aseguradoras', 'MEDISEGURA', 'MediSegura'],
      ['aseguradoras', 'PARTICULAR', 'Particular'],
      ['especialidades', 'MEDICINA-GENERAL', 'Médico General'],
      ['especialidades', 'MEDICINA-INTERNA', 'Medicina Interna'],
      ['especialidades', 'GINECOLOGIA', 'Ginecología'],
      ['especialidades', 'PEDIATRIA', 'Pediatría'],
      ['especialidades', 'CARDIOLOGIA', 'Cardiología'],
      ['especialidades', 'DERMATOLOGIA', 'Dermatología'],
      ['consultorios', 'CONSULTORIO-1', 'Consultorio 1'],
      ['consultorios', 'CONSULTORIO-2', 'Consultorio 2'],
      ['consultorios', 'CONSULTORIO-3', 'Consultorio 3'],
      ['estadosCita', 'CONFIRMADA', 'confirmada'],
      ['estadosCita', 'PENDIENTE', 'pendiente'],
      ['estadosCita', 'EN-CONSULTA', 'en_consulta'],
      ['estadosCita', 'CANCELADA', 'cancelada'],
      ['estadosCita', 'NO-ASISTIO', 'no_asistio'],
      ['estadosCita', 'BLOQUEADO', 'bloqueado'],
      ['estadosCita', 'ADMINISTRATIVO', 'administrativo'],
      ['categoriasDocumento', 'RX', 'RX'],
      ['categoriasDocumento', 'LABORATORIO', 'Laboratorio'],
      ['categoriasDocumento', 'NOTA', 'Nota'],
      ['categoriasDocumento', 'INFORME', 'Informe'],
      ['categoriasDocumento', 'DICOM', 'DICOM'],
      ['categoriasDocumento', 'EVOLUCION', 'Evolución'],
      ['categoriasDocumento', 'ELECTROCARDIOGRAMA', 'Electrocardiograma'],
      ['estudiosCatalogo', 'BH', 'Biometría hemática completa'],
      ['estudiosCatalogo', 'QS', 'Química sanguínea (perfil bioquímico 24 elementos)'],
      ['estudiosCatalogo', 'PERFIL-LIPIDOS', 'Perfil de lípidos'],
      ['estudiosCatalogo', 'EGO', 'Examen general de orina'],
      ['estudiosCatalogo', 'RX-TORAX', 'Radiografía de tórax PA'],
      ['estudiosCatalogo', 'US-ABDOMEN', 'Ultrasonido abdominal superior'],
      ['estudiosCatalogo', 'ECG', 'Electrocardiograma'],
      ['estudiosCatalogo', 'RM-RODILLA', 'Resonancia magnética de rodilla'],
      ['estudiosCatalogo', 'PERFIL-TIROIDEO', 'Perfil tiroideo'],
    ];

    for (const [tipo, codigo, nombre, metadata] of entries) {
      await queryRunner.query(
        `INSERT INTO "catalogos_clinicos" ("tipo", "codigo", "nombre", "metadata", "estado") VALUES ($1, $2, $3, $4::jsonb, 'activo')`,
        [tipo, codigo, nombre, metadata ? JSON.stringify(metadata) : null],
      );
    }

    await queryRunner.query(`UPDATE "consultas" SET "estado" = 'completada' WHERE "estado" IN ('cerrada', 'cerrado')`);
    await queryRunner.query(`
      UPDATE "consultas"
      SET "signosVitales" = jsonb_strip_nulls(jsonb_build_object(
        'ta', COALESCE("signosVitales"->'ta', "signosVitales"->'presionArterial'),
        'fc', COALESCE("signosVitales"->'fc', "signosVitales"->'frecuenciaCardiaca'),
        'fr', "signosVitales"->'fr',
        'temp', COALESCE("signosVitales"->'temp', "signosVitales"->'temperatura'),
        'spo2', "signosVitales"->'spo2',
        'peso', COALESCE("signosVitales"->'peso', "signosVitales"->'pesoKg'),
        'talla', "signosVitales"->'talla',
        'imc', "signosVitales"->'imc'
      ))
      WHERE "signosVitales" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "consultas"
      SET "diagnosticos" = (
        SELECT COALESCE(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'cie10', COALESCE(diagnostico->'cie10', diagnostico->'codigo'),
          'descripcion', diagnostico->'descripcion',
          'tipo', COALESCE(diagnostico->'tipo', '"definitivo"'::jsonb),
          'principal', diagnostico->'principal'
        ))), '[]'::jsonb)
        FROM jsonb_array_elements("diagnosticos") AS diagnostico
      )
      WHERE jsonb_typeof("diagnosticos") = 'array'
    `);

    await queryRunner.query(`
      INSERT INTO "permisos" ("clave", "descripcion") VALUES
        ('catalogos:leer', 'Consultar catálogos clínicos'),
        ('catalogos:gestionar', 'Administrar catálogos clínicos')
      ON CONFLICT ("clave") DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO "rol_permisos" ("rolId", "permisoId")
      SELECT rol."id", permiso."id"
      FROM "roles" rol
      CROSS JOIN "permisos" permiso
      WHERE (rol."nombre" IN ('ADMIN', 'MEDICO', 'ASISTENTE') AND permiso."clave" = 'catalogos:leer')
         OR (rol."nombre" = 'ADMIN' AND permiso."clave" = 'catalogos:gestionar')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "rol_permisos"
      WHERE "permisoId" IN (SELECT "id" FROM "permisos" WHERE "clave" IN ('catalogos:leer', 'catalogos:gestionar'))
    `);
    await queryRunner.query(`DELETE FROM "permisos" WHERE "clave" IN ('catalogos:leer', 'catalogos:gestionar')`);
    await queryRunner.query(`DROP INDEX "public"."IDX_catalogos_clinicos_tipo_estado"`);
    await queryRunner.query(`DROP TABLE "catalogos_clinicos"`);
  }
}
