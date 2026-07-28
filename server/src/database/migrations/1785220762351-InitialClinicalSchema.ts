import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialClinicalSchema1785220762351 implements MigrationInterface {
    name = 'InitialClinicalSchema1785220762351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recetas" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "folio" character varying NOT NULL, "pacienteId" uuid NOT NULL, "medicoId" uuid NOT NULL, "fecha" date NOT NULL, "tipo" character varying NOT NULL, "vigenciaDias" integer, "medicamentos" jsonb, "interacciones" jsonb, "notasPaciente" text, "firma" jsonb, "estado" character varying NOT NULL DEFAULT 'activa', CONSTRAINT "UQ_8e21a8588d779700cfd94df366d" UNIQUE ("folio"), CONSTRAINT "PK_a6aab8454e63427220402884c73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "estudios" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "pacienteId" uuid NOT NULL, "medicoId" uuid NOT NULL, "fecha" date NOT NULL, "tipoEstudio" character varying NOT NULL, "estudiosSolicitados" text array, "prioridad" character varying NOT NULL DEFAULT 'rutina', "estado" character varying NOT NULL DEFAULT 'solicitado', "notas" text, CONSTRAINT "PK_d7791f4a9b2e2d998de26af94e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medicos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nombre" character varying NOT NULL, "especialidad" character varying NOT NULL, "cedula" character varying NOT NULL, "consultorio" character varying, "firma" text, "estado" character varying NOT NULL DEFAULT 'activo', CONSTRAINT "PK_f16d578e9fd6df731d5e8551725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "consultas" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "pacienteId" uuid NOT NULL, "medicoId" uuid NOT NULL, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL, "tipo" character varying NOT NULL, "motivoConsulta" text, "padecimientoActual" text, "sintomas" text array, "signosVitales" jsonb, "exploracionFisica" text, "antecedentes" jsonb, "diagnosticos" jsonb, "planTerapeutico" text array, "notas" text, "duracion" character varying, "estado" character varying NOT NULL DEFAULT 'en_curso', CONSTRAINT "PK_889a9011f1854a60a6aae1c6d80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documentos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "pacienteId" uuid NOT NULL, "tipo" character varying NOT NULL, "categoria" character varying NOT NULL, "nombre" character varying NOT NULL, "fecha" TIMESTAMP WITH TIME ZONE NOT NULL, "fuente" character varying, "modalidad" character varying, "tecnico" character varying, "tags" text array, "descripcion" text, "tamano" character varying, CONSTRAINT "PK_30b7ee230a352e7582842d1dc02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "pacientes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nombre" character varying NOT NULL, "apellidos" character varying NOT NULL, "fechaNacimiento" date NOT NULL, "sexo" character varying NOT NULL, "estadoCivil" character varying, "grupoSanguineo" character varying, "curp" character varying, "nss" character varying, "foto" character varying, "contacto" jsonb, "aseguradora" jsonb, "contactoEmergencia" jsonb, "alergias" jsonb, "alertas" jsonb, "estado" character varying NOT NULL DEFAULT 'activo', "fechaRegistro" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aa9c9f624ff22fc06c44d8b1609" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "citas" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "pacienteId" uuid, "medicoId" uuid NOT NULL, "consultorioId" character varying, "fecha" date NOT NULL, "horaInicio" TIME NOT NULL, "horaFin" TIME, "motivo" character varying, "estado" character varying NOT NULL DEFAULT 'pendiente', "notas" text, "recordatorios" jsonb, CONSTRAINT "PK_43851fd780e10030fbe5bb1b912" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recetas" ADD CONSTRAINT "FK_3769c874124e7706f06b1e59b83" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recetas" ADD CONSTRAINT "FK_5d258bce64b32045e2b0a09f2be" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estudios" ADD CONSTRAINT "FK_19cf61a0baac46c2aa2784826ca" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "estudios" ADD CONSTRAINT "FK_dd27b3af9916cc3a652116e4dee" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultas" ADD CONSTRAINT "FK_df1b87b9ce3ca8a55da58704bc9" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "consultas" ADD CONSTRAINT "FK_829602c1f0802c102a6199037c9" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "documentos" ADD CONSTRAINT "FK_eb66316a81a0d8ee5ce9defbe00" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "citas" ADD CONSTRAINT "FK_8fd4b119d549914f5bafe0cc189" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "citas" ADD CONSTRAINT "FK_55f6046b4622b127d119acd7282" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "citas" DROP CONSTRAINT "FK_55f6046b4622b127d119acd7282"`);
        await queryRunner.query(`ALTER TABLE "citas" DROP CONSTRAINT "FK_8fd4b119d549914f5bafe0cc189"`);
        await queryRunner.query(`ALTER TABLE "documentos" DROP CONSTRAINT "FK_eb66316a81a0d8ee5ce9defbe00"`);
        await queryRunner.query(`ALTER TABLE "consultas" DROP CONSTRAINT "FK_829602c1f0802c102a6199037c9"`);
        await queryRunner.query(`ALTER TABLE "consultas" DROP CONSTRAINT "FK_df1b87b9ce3ca8a55da58704bc9"`);
        await queryRunner.query(`ALTER TABLE "estudios" DROP CONSTRAINT "FK_dd27b3af9916cc3a652116e4dee"`);
        await queryRunner.query(`ALTER TABLE "estudios" DROP CONSTRAINT "FK_19cf61a0baac46c2aa2784826ca"`);
        await queryRunner.query(`ALTER TABLE "recetas" DROP CONSTRAINT "FK_5d258bce64b32045e2b0a09f2be"`);
        await queryRunner.query(`ALTER TABLE "recetas" DROP CONSTRAINT "FK_3769c874124e7706f06b1e59b83"`);
        await queryRunner.query(`DROP TABLE "citas"`);
        await queryRunner.query(`DROP TABLE "pacientes"`);
        await queryRunner.query(`DROP TABLE "documentos"`);
        await queryRunner.query(`DROP TABLE "consultas"`);
        await queryRunner.query(`DROP TABLE "medicos"`);
        await queryRunner.query(`DROP TABLE "estudios"`);
        await queryRunner.query(`DROP TABLE "recetas"`);
    }

}
