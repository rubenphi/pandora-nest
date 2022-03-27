import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCuestionarioDto, UpdateCuestionarioDto } from './dto';
import { Cuestionario } from './cuestionario.entity';
import { Curso } from '../cursos/curso.entity';

@Injectable()
export class CuestionariosService {
	constructor(
		@InjectRepository(Cuestionario)
		private readonly cuestionarioRepository: Repository<Cuestionario>,
		@InjectRepository(Curso)
		private readonly cursoRepository: Repository<Curso>,
	) {}

	async getCuestionarios(): Promise<Cuestionario[]> {
		return await this.cuestionarioRepository.find();
	}
	async getCuestionario(id: number): Promise<Cuestionario> {
		const cuestionario: Cuestionario =
			await this.cuestionarioRepository.findOne({
				where: { id: id },
				relations: ['curso'],
			});
		if (!cuestionario) {
			throw new NotFoundException('Cuestionario no encontrado');
		}
		return cuestionario;
	}
	async createCuestionario(
		cuestionarioDto: CreateCuestionarioDto,
	): Promise<Cuestionario> {
		const curso: Curso = await this.cursoRepository.findOne({
			where: { id: cuestionarioDto.curso_id },
		});
		const cuestionario: Cuestionario = await this.cuestionarioRepository.create(
			{
				theme: cuestionarioDto.theme,
				date: cuestionarioDto.date,
				curso: curso,
				exist: cuestionarioDto.exist,
			},
		);
		return this.cuestionarioRepository.save(cuestionario);
	}
	async updateCuestionario(
		id: number,
		cuestionarioDto: UpdateCuestionarioDto,
	): Promise<Cuestionario> {
		const curso: Curso = await this.cursoRepository.findOne({
			where: { id: cuestionarioDto.curso_id },
		});
		const cuestionario: Cuestionario =
			await this.cuestionarioRepository.preload({
				id: id,
				theme: cuestionarioDto.theme,
				date: cuestionarioDto.date,
				curso: curso,
				exist: cuestionarioDto.exist,
			});
		if (!cuestionario) {
			throw new NotFoundException(
				'El cuestionario que deseas actualizar no existe',
			);
		}
		return cuestionario;
	}
 
	async deleteCuestionario(id: number): Promise<void> {
		const cuestionario: Cuestionario = await this.cuestionarioRepository.findOne({
			where: { id: id },
		});
		if (!cuestionario) {
			throw new NotFoundException('El cuestionario que deseas eliminar no existe');
		}
		this.cuestionarioRepository.remove(cuestionario);
	}
}
