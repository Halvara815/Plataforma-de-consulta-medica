import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuditAppendOnly1785258300000 implements MigrationInterface {
  name = 'AuditAppendOnly1785258300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE FUNCTION prevent_auditoria_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'La tabla auditoria es append-only';
      END;
      $$ LANGUAGE plpgsql;
    `);
    await queryRunner.query(`
      CREATE TRIGGER auditoria_append_only
      BEFORE UPDATE OR DELETE ON auditoria
      FOR EACH ROW EXECUTE FUNCTION prevent_auditoria_mutation();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS auditoria_append_only ON auditoria`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS prevent_auditoria_mutation()`);
  }
}
