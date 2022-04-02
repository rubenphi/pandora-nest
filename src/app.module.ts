import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CursosModule } from './modules/cursos/cursos.module';
import { GruposModule } from './modules/grupos/grupos.module';
import { CuestionariosModule } from './modules/cuestionarios/cuestionarios.module';
import { PreguntasModule } from './modules/preguntas/preguntas.module';
import { FilesController } from './modules/files/files.controller';

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
		PreguntasModule,
	],
	controllers: [FilesController],
})
export class AppModule {}
