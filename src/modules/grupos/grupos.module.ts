import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GruposController } from './grupos.controller';
import { GruposService } from './grupos.service';
import { Grupo } from './grupo.entity';
import { Curso } from '../cursos/curso.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Grupo, Curso])],
	controllers: [GruposController],
	providers: [GruposService],
})
export class GruposModule {}
