import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecetaFolioSequence1785270000000 implements MigrationInterface {
  name = 'RecetaFolioSequence1785270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE recetas_folio_seq START 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE IF EXISTS recetas_folio_seq`);
  }
}
