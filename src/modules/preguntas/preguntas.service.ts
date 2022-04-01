import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { Pregunta } from './pregunta.entity';
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto';
import { Cuestionario } from '../cuestionarios/cuestionario.entity';

@Injectable()
export class PreguntasService {
	constructor(
		@InjectRepository(Pregunta)
		private readonly preguntaRepository: Repository<Pregunta>,
		@InjectRepository(Cuestionario)
		private readonly cuestionarioRepository: Repository<Cuestionario>,
	) {}

	async getPreguntas(): Promise<Pregunta[]> {
		return await this.preguntaRepository.find({ relations: ['cuestionario'] });
	}
	async getPregunta(id: number): Promise<Pregunta> {
		const pregunta: Pregunta = await this.preguntaRepository.findOne({
			where: { id: id },
			relations: ['curso'],
		});
		if (!pregunta) {
			throw new NotFoundException('Pregunta no encontrada');
		}
		return pregunta;
	}
	async createPregunta(preguntaDto: CreatePreguntaDto): Promise<Pregunta> {
		const cuestionario: Cuestionario =
			await this.cuestionarioRepository.findOne({
				where: { id: preguntaDto.cuestionario_id },
			});
		const pregunta: Pregunta = await this.preguntaRepository.create({
			title: preguntaDto.titulo,
			enunciado: preguntaDto.enunciado,
			cuestionario: cuestionario,
			valor: preguntaDto.valor,
			photo: preguntaDto.photo,
			visible: preguntaDto.visible,
			disponible: preguntaDto.disponible,
			exist: preguntaDto.exist,
		});
		return this.preguntaRepository.save(pregunta);
	}
	async updatePregunta(
		id: number,
		preguntaDto: UpdatePreguntaDto,
	): Promise<Pregunta> {
		const cuestionario: Cuestionario =
			await this.cuestionarioRepository.findOne({
				where: { id: preguntaDto.cuestionario_id },
			});
		const imageUrl = await (await this.preguntaRepository.findOne( { where: {id: id} })).photo;
		const pregunta: Pregunta = await this.preguntaRepository.preload({
			id: id,
			title: preguntaDto.titulo,
			enunciado: preguntaDto.enunciado,
			cuestionario: cuestionario,
			valor: preguntaDto.valor,
			photo: preguntaDto.photo,
			visible: preguntaDto.visible,
			disponible: preguntaDto.disponible,
			exist: preguntaDto.exist,
		});
		if (!pregunta) {
			throw new NotFoundException('La pregunta que deseas actualizar no existe');
		}else if(pregunta && !pregunta.photo) {
			fs.unlinkSync(imageUrl);
		}
		return pregunta;
	}

	async deletePregunta(id: number): Promise<void> {
		const pregunta: Pregunta = await this.preguntaRepository.findOne({
			where: { id: id },
		});
		if (!pregunta) {
			throw new NotFoundException('La pregunta que deseas eliminar no existe');
		}else if(pregunta.photo) {
			fs.unlinkSync(pregunta.photo);
		}
		this.preguntaRepository.remove(pregunta);
	}
}
