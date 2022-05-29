import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const source = new DataSource({
	type: process.env.DB_TYPE as any,
	host: process.env.DB_HOST,
	username: process.env.PGUSER,
	password: process.env.DB_PASSWORD,
	database: process.env.PGDATABASE,
	dropSchema: false,
	synchronize: true,
	entities: [join(__dirname, '**', '**', '*.entity.{ts,js}')],
	migrations: [join(__dirname, 'database', 'migrations', '*.{ts,js}')],
});

export default source;
