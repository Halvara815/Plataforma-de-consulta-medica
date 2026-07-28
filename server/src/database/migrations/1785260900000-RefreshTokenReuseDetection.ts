import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefreshTokenReuseDetection1785260900000 implements MigrationInterface {
  name = 'RefreshTokenReuseDetection1785260900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sesionId" uuid NOT NULL,
        "tokenHash" character varying NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "consumedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_refresh_tokens_token_hash" UNIQUE ("tokenHash"),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "FK_refresh_tokens_sesion" FOREIGN KEY ("sesionId") REFERENCES "sesiones"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_sesion_consumed" ON "refresh_tokens" ("sesionId", "consumedAt")`);
    await queryRunner.query(`
      INSERT INTO "refresh_tokens" ("sesionId", "tokenHash", "expiresAt")
      SELECT "id", "tokenHash", "expiresAt" FROM "sesiones"
      ON CONFLICT ("tokenHash") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
