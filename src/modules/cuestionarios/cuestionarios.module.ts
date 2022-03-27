import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CuestionariosService } from './cuestionarios.service';
import { CuestionariosController } from './cuestionarios.controller';
import { Cuestionario } from '../cuestionarios/cuestionario.entity';
import { Curso } from '../cursos/curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cuestionario, Curso])],
  providers: [CuestionariosService],
  controllers: [CuestionariosController]
})
export class CuestionariosModule {}
