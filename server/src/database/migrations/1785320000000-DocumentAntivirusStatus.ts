import { MigrationInterface, QueryRunner } from 'typeorm';

export class DocumentAntivirusStatus1785320000000 implements MigrationInterface {
  name = 'DocumentAntivirusStatus1785320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "documentos" ADD "scanStatus" character varying');
    await queryRunner.query('ALTER TABLE "documentos" ADD "scannedAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('CREATE INDEX "IDX_documentos_scanStatus" ON "documentos" ("scanStatus")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_documentos_scanStatus"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "scannedAt"');
    await queryRunner.query('ALTER TABLE "documentos" DROP COLUMN "scanStatus"');
  }
}
