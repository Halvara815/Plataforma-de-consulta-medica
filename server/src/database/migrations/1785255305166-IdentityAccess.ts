import { MigrationInterface, QueryRunner } from "typeorm";

export class IdentityAccess1785255305166 implements MigrationInterface {
    name = 'IdentityAccess1785255305166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permisos" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "clave" character varying NOT NULL, "descripcion" character varying NOT NULL, CONSTRAINT "UQ_0da1398fc247170cac89e492051" UNIQUE ("clave"), CONSTRAINT "PK_3127bd9cfeb13ae76186d0d9b38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "nombre" character varying NOT NULL, "descripcion" character varying, CONSTRAINT "UQ_a5be7aa67e759e347b1c6464e10" UNIQUE ("nombre"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sesiones" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "usuarioId" uuid NOT NULL, "tokenHash" character varying NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a5529fd93e2fea9ce42184a1832" UNIQUE ("tokenHash"), CONSTRAINT "PK_e4237ef09f1dc217c1660f23253" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1e2e12e2ffd791298d701f2ae5" ON "sesiones" ("usuarioId") `);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "nombre" character varying NOT NULL, "estado" character varying NOT NULL DEFAULT 'activo', "medicoId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "UQ_5f3375ddf28e307425f9156f802" UNIQUE ("medicoId"), CONSTRAINT "REL_5f3375ddf28e307425f9156f80" UNIQUE ("medicoId"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auditoria" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "usuarioId" uuid, "accion" character varying NOT NULL, "recursoTipo" character varying NOT NULL, "recursoId" character varying, "resultado" character varying NOT NULL, "correlationId" character varying, "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_135fe98308816fe3a2d458e6637" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2cfb6d702f3280befd260c3ab3" ON "auditoria" ("recursoTipo", "recursoId", "createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_4bafcaa2d0123f5520f1f23c36" ON "auditoria" ("usuarioId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "rol_permisos" ("rolId" uuid NOT NULL, "permisoId" uuid NOT NULL, CONSTRAINT "PK_067796fbfaef54cc93449fa4388" PRIMARY KEY ("rolId", "permisoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b39138a3ce555d2ecd72ce5754" ON "rol_permisos" ("rolId") `);
        await queryRunner.query(`CREATE INDEX "IDX_a19038a8652d3e0ac882cf2141" ON "rol_permisos" ("permisoId") `);
        await queryRunner.query(`CREATE TABLE "usuario_roles" ("usuarioId" uuid NOT NULL, "rolId" uuid NOT NULL, CONSTRAINT "PK_8c9ac8bb96e75e7cee4b7c4673e" PRIMARY KEY ("usuarioId", "rolId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_84b8fb5afed97d1a5632599e1d" ON "usuario_roles" ("usuarioId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8fb38fb2056d91e441af6a63ef" ON "usuario_roles" ("rolId") `);
        await queryRunner.query(`ALTER TABLE "sesiones" ADD CONSTRAINT "FK_1e2e12e2ffd791298d701f2ae55" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "FK_5f3375ddf28e307425f9156f802" FOREIGN KEY ("medicoId") REFERENCES "medicos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auditoria" ADD CONSTRAINT "FK_f913378245e2c5fd5514691f327" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rol_permisos" ADD CONSTRAINT "FK_b39138a3ce555d2ecd72ce57540" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "rol_permisos" ADD CONSTRAINT "FK_a19038a8652d3e0ac882cf2141e" FOREIGN KEY ("permisoId") REFERENCES "permisos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "usuario_roles" ADD CONSTRAINT "FK_84b8fb5afed97d1a5632599e1db" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "usuario_roles" ADD CONSTRAINT "FK_8fb38fb2056d91e441af6a63ef6" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "usuario_roles" DROP CONSTRAINT "FK_8fb38fb2056d91e441af6a63ef6"`);
        await queryRunner.query(`ALTER TABLE "usuario_roles" DROP CONSTRAINT "FK_84b8fb5afed97d1a5632599e1db"`);
        await queryRunner.query(`ALTER TABLE "rol_permisos" DROP CONSTRAINT "FK_a19038a8652d3e0ac882cf2141e"`);
        await queryRunner.query(`ALTER TABLE "rol_permisos" DROP CONSTRAINT "FK_b39138a3ce555d2ecd72ce57540"`);
        await queryRunner.query(`ALTER TABLE "auditoria" DROP CONSTRAINT "FK_f913378245e2c5fd5514691f327"`);
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "FK_5f3375ddf28e307425f9156f802"`);
        await queryRunner.query(`ALTER TABLE "sesiones" DROP CONSTRAINT "FK_1e2e12e2ffd791298d701f2ae55"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fb38fb2056d91e441af6a63ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_84b8fb5afed97d1a5632599e1d"`);
        await queryRunner.query(`DROP TABLE "usuario_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a19038a8652d3e0ac882cf2141"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b39138a3ce555d2ecd72ce5754"`);
        await queryRunner.query(`DROP TABLE "rol_permisos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4bafcaa2d0123f5520f1f23c36"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cfb6d702f3280befd260c3ab3"`);
        await queryRunner.query(`DROP TABLE "auditoria"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1e2e12e2ffd791298d701f2ae5"`);
        await queryRunner.query(`DROP TABLE "sesiones"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "permisos"`);
    }

}
