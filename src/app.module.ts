import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosModule } from './modules/cursos/cursos.module';

@Module({
	imports: [
		CursosModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'ruben',
			password: 'japon93',
			database: 'pandora',
			autoLoadEntities: true,
			synchronize: true,
		}),
	],
})
export class AppModule {}
