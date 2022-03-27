import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosModule } from './modules/cursos/cursos.module';
import { GruposModule } from './modules/grupos/grupos.module';
import { CuestionariosModule } from './modules/cuestionarios/cuestionarios.module';

@Module({
	imports: [
		CursosModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: '127.0.0.1',
			port: 5432,
			username: 'ruben',
			password: 'japon93',
			database: 'pandora',
			autoLoadEntities: true,
			synchronize: true,
		}),
		GruposModule,
		CuestionariosModule,
	],
})
export class AppModule {}
