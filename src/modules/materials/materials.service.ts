import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';

@Injectable()
export class MaterialsService {
	constructor(
		@InjectRepository(Material)
		private readonly materialRepository: Repository<Material>,
	) {}

	async findOne(id: number): Promise<Material> {
		return this.materialRepository.findOne({ where: { id } });
	}
}
