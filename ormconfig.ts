import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const source = new DataSource({
	type: process.env.DB_TYPE as any,
	host: process.env.DB_HOST,
	database: process.env.DB_NAME,
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	dropSchema: false,
	synchronize: true,
	entities: [join(__dirname, '**', '**', '*.entity.{ts,js}')],
	migrations: [join(__dirname, 'src', 'database', 'migrations', '*.{ts,js}')],
});
export default source;
