import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PreguntasService } from './preguntas.service';
import { PreguntasController } from './preguntas.controller';
import { Pregunta } from './pregunta.entity';
import { Cuestionario } from '../cuestionarios/cuestionario.entity';
@Module({
	imports: [TypeOrmModule.forFeature([Pregunta, Cuestionario])],
	providers: [PreguntasService],
	controllers: [PreguntasController],
})
export class PreguntasModule {}
