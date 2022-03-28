import { Module } from '@nestjs/common';
import { PreguntasService } from './preguntas.service';
import { PreguntasController } from './preguntas.controller';

@Module({
  providers: [PreguntasService],
  controllers: [PreguntasController]
})
export class PreguntasModule {}
