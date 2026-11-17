import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Carga el archivo .env correcto según el entorno
dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? 'backend/.env'
    : '.env',
});

const isProduction = process.env.NODE_ENV === 'production';
const dbType = (process.env.DB_TYPE || 'postgres').toLowerCase();

let source: DataSource;

if (dbType === 'sqlite') {
  const dataDir = join(__dirname, 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = process.env.DB_DATABASE || join(dataDir, 'pandora.sqlite');

  source = new DataSource({
    type: 'sqlite',
    database: dbPath,
    dropSchema: false,
    synchronize: !isProduction,
    entities: [
      isProduction
        ? join(__dirname, '**', '*.entity.js')
        : join(__dirname, 'src', '**', '*.entity.ts'),
    ],
  });
} else {
  source = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dropSchema: false,
    synchronize: !isProduction,
    entities: [
      isProduction
        ? join(__dirname, '**', '*.entity.js')
        : join(__dirname, 'src', '**', '*.entity.ts'),
    ],
    migrations: [
      isProduction
        ? join(__dirname, 'database', 'migrations', '*.js')
        : join(__dirname, 'src', 'database', 'migrations', '*.ts'),
    ],
  });
}

export default source;
