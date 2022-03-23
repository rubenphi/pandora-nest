import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './curso.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Curso])],
	controllers: [CursosController],
	providers: [CursosService],
})
export class CursosModule {}
