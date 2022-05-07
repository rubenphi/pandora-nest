import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"

const config: PostgresConnectionOptions = {
	type: "postgres",
	host: "127.0.0.1",
	username: "ruben",
	password: "japon93",
	port: 5432,
	database: "pandora",
	entities: ["dist/src/**/**/*.entity{.ts,.js}"],
	synchronize: true,
	migrations: ["dist/src/database/migrations/*{.ts,.js}"],
	migrationsTableName: "custom_migration_table"
}

export default config;