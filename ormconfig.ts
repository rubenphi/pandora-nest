import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carga el archivo .env correcto según el entorno
dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? 'backend/.env'
    : '.env',
});

const isProduction = process.env.NODE_ENV === 'production';

const source = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dropSchema: false,
  synchronize: !isProduction, // Sincroniza solo en desarrollo
  entities: [
    // En producción, busca archivos .js en dist. En desarrollo, .ts en src.
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

export default source;