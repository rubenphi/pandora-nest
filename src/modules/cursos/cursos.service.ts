import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Curso } from './curso.entity';
import { CreateCursoDto, UpdateCursoDto } from './dto';

@Injectable()
export class CursosService {
	constructor(
		@InjectRepository(Curso)
		private readonly cursoRepository: Repository<Curso>,
	) {}

	async getCursos(): Promise<Curso[]> {
		return await this.cursoRepository.find();
	}
	async getCurso(id: number): Promise<Curso> {
		const curso: Curso = await this.cursoRepository.findOne({
			where: { id: id },
			relations: ['grupos'],
		});
		if (!curso) {
			throw new NotFoundException('Curso no encontrado');
		}
		return curso;
	}
	async createCurso(cursoDto: CreateCursoDto): Promise<Curso> {
		const curso: Curso = await this.cursoRepository.create(cursoDto);
		return this.cursoRepository.save(curso);
	}
	async updateCurso(id: number, cursoDto: UpdateCursoDto): Promise<Curso> {
		const curso: Curso = await this.cursoRepository.preload({
			id: id,
			name: cursoDto.name,
			exist: cursoDto.exist,
		});
		if (!curso) {
			throw new NotFoundException('El curso que deseas actualizar no existe');
		}
		return curso;
	}

	async deleteCurso(id: number): Promise<void> {
		const curso: Curso = await this.cursoRepository.findOne({
			where: { id: id },
		});
		if (!curso) {
			throw new NotFoundException('El curso que deseas eliminar no existe');
		}
		this.cursoRepository.remove(curso);
	}
}
