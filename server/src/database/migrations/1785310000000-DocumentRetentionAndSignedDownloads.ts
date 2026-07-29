import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentRetentionAndSignedDownloads1785310000000 implements MigrationInterface {
  name = 'DocumentRetentionAndSignedDownloads1785310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "documentos" ADD "deletedBy" character varying');
    await queryRunner.query('CREATE INDEX "IDX_documentos_estado_deletedAt" ON "documentos" ("estado", "deletedAt")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_documentos_estado_deletedAt"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "deletedBy"');
  }
}
