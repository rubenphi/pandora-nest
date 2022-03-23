import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { Curso } from './curso.entity';
import { CreateCursoDto, UpdateCursoDto } from './dto';

@Injectable()
export class CursosService {
	constructor(private readonly cursoRepository: Repository<Curso>) {}

	async getCursos(): Promise<Curso[]> {
		return await this.cursoRepository.find();
	}
	async getCurso(id: number): Promise<Curso> {
		const curso = await this.cursoRepository.findOne({ where: { id: id } });
		if (!curso) {
			throw new NotFoundException('Curso no encontrado');
		}
		return curso;
	}
	async createCurso(cursoDto: CreateCursoDto) {
		const curso = await this.cursoRepository.create(cursoDto);
		return this.cursoRepository.save(curso);
	}
	async updateCurso(id: number, cursoDto: UpdateCursoDto) {
		const curso: Curso = await this.cursoRepository.preload({ id, cursoDto });
		curso.exist = cursoDto.exist;
		curso.name = cursoDto.name;
		return curso;
	}

	deleteCurso(id: number) {
		const index = this.cursos.findIndex((curso) => curso.id === id);
		if (index >= 0) {
			this.cursos.splice(index, 1);
		}
	}
}
