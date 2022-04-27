import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Area } from './area.entity';
import { Lesson } from '../lessons/lesson.entity';
import { CreateAreaDto, UpdateAreaDto } from './dto';

@Injectable()
export class AreasService {
    constructor(
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
	) {}

	async getAreas(): Promise<Area[]> {
		return await this.areaRepository.find();
	}
	async getArea(id: number): Promise<Area> {
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id }
			})
			.catch(() => {
				throw new NotFoundException('Area not found');
			});
		return area;
	}
	async createArea(areaDto: CreateAreaDto): Promise<Area> {

		const area: Area = await this.areaRepository.create({
			name: areaDto.name,
			exist: areaDto.exist,
		});
		return this.areaRepository.save(area);
	}
	async updateArea(id: number, areaDto: UpdateAreaDto): Promise<Area> {

		const area: Area = await this.areaRepository.preload({
			id: id,
			name: areaDto.name,
			exist: areaDto.exist,
		});
		if (!area) {
			throw new NotFoundException(
				'The area you want to update does not exist',
			);
		}
		return this.areaRepository.save(area);
	}

	async deleteArea(id: number): Promise<void> {
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The area you want to delete does not exist',
				);
			});
		this.areaRepository.remove(area);
	}

	async getLessonsByArea(id: number): Promise<Lesson[]> {
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Area not found');
			});
		return area.lessons;
	}
}
