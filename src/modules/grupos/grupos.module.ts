import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GruposService } from './grupos.service';
import { GruposController } from './grupos.controller';
import { Grupo } from './grupo.entity';
import { Curso } from '../cursos/curso.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Grupo, Curso])],
	providers: [GruposService],
	controllers: [GruposController],
})
export class GruposModule {}
