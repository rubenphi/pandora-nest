import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Area } from './area.entity';
import { Lesson } from '../lessons/lesson.entity';
import { CreateAreaDto, UpdateAreaDto, QueryAreaDto } from './dto';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class AreasService {
	constructor(
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getAreas(queryArea: QueryAreaDto, user: User): Promise<Area[]> {
		if (queryArea) {
			return await this.areaRepository.find({
				where: { name: queryArea.name, exist: queryArea.exist, 
					institute: { id: user.rol == Role.Admin ? queryArea.instituteId : user.institute.id }
				},
				relations: ['institute'],
			});
		} else {
			return await this.areaRepository.find({ relations: ['institute'] });
		}
	}
	async getArea(id: number, user: User): Promise<Area> {
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Area not found');
			});
			if(user.institute.id !== area.institute.id){
				throw new ForbiddenException('You are not allowed to view this area');
			}
		return area;
	}
	async createArea(areaDto: CreateAreaDto, user: User): Promise<Area> {
		if(user.institute.id !== areaDto.instituteId){
			throw new ForbiddenException('You are not allowed to create this area');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: areaDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const area: Area = await this.areaRepository.create({
			name: areaDto.name,
			institute,
			exist: areaDto.exist,
		});
		return this.areaRepository.save(area);
	}
	async updateArea(id: number, areaDto: UpdateAreaDto, user: User): Promise<Area> {
		if(user.institute.id !== areaDto.instituteId){
			throw new ForbiddenException('You are not allowed to update this area');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: areaDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const area: Area = await this.areaRepository.preload({
			id: id,
			name: areaDto.name,
			institute,
			exist: areaDto.exist,
		});
		if (!area) {
			throw new NotFoundException('The area you want to update does not exist');
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

	async getLessonsByArea(id: number, user: User): Promise<Lesson[]> {
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Area not found');
			});
			if(user.institute.id !== area.institute.id){
				throw new ForbiddenException('You are not allowed to view the lessons of this area');
			}
		return area.lessons;
	}
}
