import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Grupo } from './grupo.entity';
import { CreateGrupoDto, UpdateGrupoDto } from './dto';

@Injectable()
export class GruposService {
    constructor(
		@InjectRepository(Grupo)
		private readonly grupoRepository: Repository<Grupo>,
	) {}

    async getGrupos(): Promise<Grupo[]> {
		return await this.grupoRepository.find({ relations: ['curso'] });
	}
	async getGrupo(id: number): Promise<Grupo> {
		const grupo: Grupo = await this.grupoRepository.findOne({
			where: { id: id },
			relations: ['curso'],
		});
		if (!grupo) {
			throw new NotFoundException('Grupo no encontrado');
		}
		return grupo;
	}
	async createGrupo(grupoDto: CreateGrupoDto): Promise<Grupo> {
		const grupo: Grupo = await this.grupoRepository.create(grupoDto);
		return this.grupoRepository.save(grupo);
	}
	async updateGrupo(id: number, grupoDto: UpdateGrupoDto): Promise<Grupo> {
		const { name, exist } = grupoDto;
		const grupo: Grupo = await this.grupoRepository.preload({
			id,
			name,
			exist,
		});
		if (!grupo) {
			throw new NotFoundException('El grupo que deseas actualizar no existe');
		}
		return grupo;
	}

	async deleteGrupo(id: number): Promise<void> {
		const grupo: Grupo = await this.grupoRepository.findOne({
			where: { id: id },
		});
		if (!grupo) {
			throw new NotFoundException('El grupo que deseas eliminar no existe');
		}
		this.grupoRepository.remove(grupo);
	}
}
