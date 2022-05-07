import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

export = 
  {
    type: process.env.DB_TYPE,
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    options: {
      instanceName: process.env.DEFAULT_DB_INSTANCE,
      enableArithAbort: false,
    },
    dropSchema: false,
    synchronize: false,
    migrations: [join(__dirname, '..', 'database/migrations/*.{ts,js}')],
    cli: {
      migrationsDir: 'src/database/migrations',
    },
    autoLoadEntities: true,
  } as TypeOrmModuleOptions
; 