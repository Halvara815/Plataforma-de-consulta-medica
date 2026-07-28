import { config } from 'dotenv';
import { join } from 'path';
import { Client } from 'pg';

export default async function globalSetup(): Promise<void> {
  config({ path: join(__dirname, '..', '.env') });

  const baseDbName = process.env.DB_NAME;
  if (!baseDbName) {
    throw new Error('DB_NAME no está definido. Copia server/.env.example a server/.env antes de correr las pruebas.');
  }
  const testDbName = `${baseDbName}_test`;

  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: baseDbName,
  });

  await client.connect();
  try {
    const existing = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDbName]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${testDbName}"`);
    }
  } catch (error) {
    throw new Error(
      `No se pudo crear la base de pruebas "${testDbName}". Si el usuario "${process.env.DB_USERNAME}" no tiene ` +
      `privilegio CREATEDB, créala manualmente con: CREATE DATABASE "${testDbName}" OWNER "${process.env.DB_USERNAME}"; ` +
      `Detalle: ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    await client.end();
  }

  process.env.DB_NAME = testDbName;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: AppDataSource } = require('../src/database/data-source');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
}
