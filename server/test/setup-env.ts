import { config } from 'dotenv';
import { join } from 'path';

const TEST_SUFFIX = '_test';

config({ path: join(__dirname, '..', '.env') });

if (!process.env.DB_NAME) {
  throw new Error('DB_NAME no está definido. Copia server/.env.example a server/.env antes de correr las pruebas.');
}

// Este módulo se ejecuta una vez por archivo de prueba y, con `--runInBand`, todos los
// archivos comparten el mismo `process.env`. dotenv no sobreescribe variables ya
// definidas, así que DB_NAME conserva el valor con sufijo que dejó el archivo anterior;
// por eso el cálculo del sufijo debe ser idempotente en vez de concatenar sin más.
const baseDbName = process.env.DB_NAME.endsWith(TEST_SUFFIX)
  ? process.env.DB_NAME
  : `${process.env.DB_NAME}${TEST_SUFFIX}`;

process.env.NODE_ENV = 'test';
process.env.DB_NAME = baseDbName;
process.env.REDIS_ENABLED = 'false';
process.env.REDIS_REQUIRED = 'false';
