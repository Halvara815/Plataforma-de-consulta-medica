import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { Cita } from '../modules/citas/entities/cita.entity';
import { Consulta } from '../modules/consultas/entities/consulta.entity';
import { Documento } from '../modules/documentos/entities/documento.entity';
import { Estudio } from '../modules/estudios/entities/estudio.entity';
import { Medico } from '../modules/medicos/entities/medico.entity';
import { Paciente } from '../modules/pacientes/entities/paciente.entity';
import { Receta } from '../modules/recetas/entities/receta.entity';
import { Auditoria } from '../modules/auth/entities/auditoria.entity';
import { Permiso } from '../modules/auth/entities/permiso.entity';
import { Rol } from '../modules/auth/entities/rol.entity';
import { Sesion } from '../modules/auth/entities/sesion.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { Usuario } from '../modules/auth/entities/usuario.entity';
import { CatalogoClinico } from '../modules/catalogos/entities/catalogo-clinico.entity';
import { PreferenciaUsuario } from '../modules/preferencias/entities/preferencia-usuario.entity';
import { FirmaUsuario } from '../modules/preferencias/entities/firma-usuario.entity';
import { Referencia } from '../modules/referencias/entities/referencia.entity';

config({ path: join(__dirname, '..', '..', '.env') });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export default new DataSource({
  type: 'postgres',
  host: required('DB_HOST'),
  port: Number(required('DB_PORT')),
  username: required('DB_USERNAME'),
  password: required('DB_PASSWORD'),
  database: required('DB_NAME'),
  entities: [Paciente, Medico, Cita, Consulta, Receta, Estudio, Documento, Usuario, Rol, Permiso, Sesion, RefreshToken, Auditoria, CatalogoClinico, PreferenciaUsuario, FirmaUsuario, Referencia],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
});
