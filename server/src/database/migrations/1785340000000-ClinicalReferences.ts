import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClinicalReferences1785340000000 implements MigrationInterface {
  name = 'ClinicalReferences1785340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "referencias" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "pacienteId" uuid NOT NULL,
        "especialidad" character varying NOT NULL,
        "medicoDestino" character varying NOT NULL,
        "fecha" date NOT NULL,
        "estado" character varying NOT NULL DEFAULT 'pendiente',
        "motivo" text NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_referencias" PRIMARY KEY ("id"),
        CONSTRAINT "FK_referencias_paciente" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_referencias_paciente_fecha" ON "referencias" ("pacienteId", "fecha")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_referencias_paciente_fecha"');
    await queryRunner.query('DROP TABLE "referencias"');
  }
}
