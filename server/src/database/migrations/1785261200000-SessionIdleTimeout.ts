import { MigrationInterface, QueryRunner } from 'typeorm';

export class SessionIdleTimeout1785261200000 implements MigrationInterface {
  name = 'SessionIdleTimeout1785261200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sesiones" ADD "lastActivityAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    await queryRunner.query(`UPDATE "sesiones" SET "lastActivityAt" = "updatedAt"`);
    await queryRunner.query(`CREATE INDEX "IDX_sesiones_last_activity" ON "sesiones" ("lastActivityAt")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_sesiones_last_activity"`);
    await queryRunner.query(`ALTER TABLE "sesiones" DROP COLUMN "lastActivityAt"`);
  }
}
