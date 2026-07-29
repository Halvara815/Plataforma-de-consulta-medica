import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecureDocumentStorage1785300000000 implements MigrationInterface {
  name = 'SecureDocumentStorage1785300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "documentos" ADD "storageKey" character varying');
    await queryRunner.query('ALTER TABLE "documentos" ADD "mimeType" character varying');
    await queryRunner.query('ALTER TABLE "documentos" ADD "sizeBytes" integer');
    await queryRunner.query('ALTER TABLE "documentos" ADD "checksum" character varying');
    await queryRunner.query('ALTER TABLE "documentos" ADD "estado" character varying NOT NULL DEFAULT \'activo\'');
    await queryRunner.query('ALTER TABLE "documentos" ADD "deletedAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('ALTER TABLE "documentos" ADD "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()');
    await queryRunner.query('ALTER TABLE "documentos" ADD "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()');
    await queryRunner.query('ALTER TABLE "documentos" ADD CONSTRAINT "UQ_documentos_storageKey" UNIQUE ("storageKey")');
    await queryRunner.query('CREATE INDEX "IDX_documentos_paciente_estado_fecha" ON "documentos" ("pacienteId", "estado", "fecha")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_documentos_paciente_estado_fecha"');
    await queryRunner.query('ALTER TABLE "documentos" DROP CONSTRAINT "UQ_documentos_storageKey"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "updatedAt"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "createdAt"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "deletedAt"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "estado"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "checksum"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "sizeBytes"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "mimeType"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "storageKey"');
  }
}
