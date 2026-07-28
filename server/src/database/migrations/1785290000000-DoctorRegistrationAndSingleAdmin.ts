import { MigrationInterface, QueryRunner } from 'typeorm';

export class DoctorRegistrationAndSingleAdmin1785290000000 implements MigrationInterface {
  name = 'DoctorRegistrationAndSingleAdmin1785290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE UNIQUE INDEX "UQ_medicos_cedula" ON "medicos" ("cedula")');
    await queryRunner.query('INSERT INTO "permisos" ("clave", "descripcion") VALUES (\'pacientes:leer\', \'Consultar pacientes\'), (\'pacientes:escribir\', \'Crear y modificar pacientes\'), (\'citas:leer\', \'Consultar agenda\'), (\'citas:escribir\', \'Crear y modificar citas\'), (\'consultas:leer\', \'Consultar notas clínicas\'), (\'consultas:escribir\', \'Crear y modificar consultas\'), (\'recetas:leer\', \'Consultar recetas\'), (\'recetas:escribir\', \'Crear y modificar recetas\'), (\'estudios:leer\', \'Consultar estudios\'), (\'estudios:escribir\', \'Crear y modificar estudios\'), (\'documentos:leer\', \'Consultar documentos\'), (\'documentos:escribir\', \'Cargar y modificar documentos\'), (\'catalogos:leer\', \'Consultar catálogos clínicos\') ON CONFLICT ("clave") DO NOTHING');
    await queryRunner.query('INSERT INTO "roles" ("nombre", "descripcion") VALUES (\'MEDICO\', \'Atención clínica\') ON CONFLICT ("nombre") DO NOTHING');
    await queryRunner.query('INSERT INTO "rol_permisos" ("rolId", "permisoId") SELECT rol."id", permiso."id" FROM "roles" rol CROSS JOIN "permisos" permiso WHERE rol."nombre" = \'MEDICO\' AND permiso."clave" IN (\'pacientes:leer\', \'pacientes:escribir\', \'citas:leer\', \'citas:escribir\', \'consultas:leer\', \'consultas:escribir\', \'recetas:leer\', \'recetas:escribir\', \'estudios:leer\', \'estudios:escribir\', \'documentos:leer\', \'documentos:escribir\', \'catalogos:leer\') ON CONFLICT DO NOTHING');
    await queryRunner.query('CREATE OR REPLACE FUNCTION "enforce_single_admin_role"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF EXISTS (SELECT 1 FROM "roles" WHERE "id" = NEW."rolId" AND "nombre" = \'ADMIN\') AND EXISTS (SELECT 1 FROM "usuario_roles" asignacion INNER JOIN "roles" rol ON rol."id" = asignacion."rolId" WHERE rol."nombre" = \'ADMIN\' AND asignacion."usuarioId" <> NEW."usuarioId") THEN RAISE EXCEPTION \'Solo puede existir una cuenta administradora\' USING ERRCODE = \'23505\'; END IF; RETURN NEW; END; $$');
    await queryRunner.query('CREATE TRIGGER "TRG_usuario_roles_single_admin" BEFORE INSERT OR UPDATE ON "usuario_roles" FOR EACH ROW EXECUTE FUNCTION "enforce_single_admin_role"()');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TRIGGER "TRG_usuario_roles_single_admin" ON "usuario_roles"');
    await queryRunner.query('DROP FUNCTION "enforce_single_admin_role"()');
    await queryRunner.query('DROP INDEX "UQ_medicos_cedula"');
  }
}
