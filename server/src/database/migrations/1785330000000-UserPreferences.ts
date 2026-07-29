import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPreferences1785330000000 implements MigrationInterface {
  name = 'UserPreferences1785330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "preferencias_usuario" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "usuarioId" uuid NOT NULL,
        "tema" character varying NOT NULL DEFAULT 'system',
        "sonidoTemporizador" boolean NOT NULL DEFAULT true,
        "notas" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "recordatorios" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "plantillas" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "favoritos" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_preferencias_usuario" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_preferencias_usuario_usuario" UNIQUE ("usuarioId"),
        CONSTRAINT "FK_preferencias_usuario_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "firmas_usuario" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "usuarioId" uuid NOT NULL,
        "nombre" character varying NOT NULL,
        "storageKey" character varying NOT NULL,
        "mimeType" character varying NOT NULL,
        "sizeBytes" integer NOT NULL,
        "checksum" character varying NOT NULL,
        "scanStatus" character varying,
        "scannedAt" TIMESTAMP WITH TIME ZONE,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_firmas_usuario" PRIMARY KEY ("id"),
        CONSTRAINT "FK_firmas_usuario_usuario" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query('CREATE INDEX "IDX_preferencias_usuario_usuario" ON "preferencias_usuario" ("usuarioId")');
    await queryRunner.query('CREATE INDEX "IDX_firmas_usuario_usuario_fecha" ON "firmas_usuario" ("usuarioId", "createdAt")');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "public"."IDX_firmas_usuario_usuario_fecha"');
    await queryRunner.query('DROP INDEX "public"."IDX_preferencias_usuario_usuario"');
    await queryRunner.query('DROP TABLE "firmas_usuario"');
    await queryRunner.query('DROP TABLE "preferencias_usuario"');
  }
}
