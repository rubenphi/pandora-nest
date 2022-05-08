import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const source = new DataSource({
    type: process.env.DB_TYPE as any,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dropSchema: false,
    synchronize: true,
    entities: ["dist/**/**/*.entity{.js,.ts}"],
    migrations: ["dist/database/migrations/*{.js,.ts}"],
    subscribers: ["dist/subscribers/**/*{.js,.ts}"],
  })

export default source;
console.log(join(__dirname, 'dist/src/**/**/*.entity.{ts,js}'))