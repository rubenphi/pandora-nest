import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Institute } from './institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	CreateInstituteDto,
	UpdateInstituteDto,
	QueryInstituteDto,
} from './dto';

@Injectable()
export class InstitutesService {
	constructor(
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getInstitutes(queryInstitute: QueryInstituteDto): Promise<Institute[]> {
		if (queryInstitute) {
			return await this.instituteRepository.find({
				where: {
					name: queryInstitute.name ? ILike(`%${queryInstitute.name}%`): null,
					exist: queryInstitute.exist,
				},
			});
		} else {
			return await this.instituteRepository.find();
		}
	}
	async getInstitute(id: number): Promise<Institute> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute;
	}
	async createInstitute(instituteDto: CreateInstituteDto): Promise<Institute> {
		const institute: Institute = await this.instituteRepository.create({
			name: instituteDto.name,
			exist: instituteDto.exist,
		});
		return this.instituteRepository.save(institute);
	}
	async updateInstitute(
		id: number,
		instituteDto: UpdateInstituteDto,
	): Promise<Institute> {
		const institute: Institute = await this.instituteRepository.preload({
			id: id,
			name: instituteDto.name,
			exist: instituteDto.exist,
		});
		if (!institute) {
			throw new NotFoundException(
				'The institute you want to update does not exist',
			);
		}
		return this.instituteRepository.save(institute);
	}

	async deleteInstitute(id: number): Promise<void> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The institute you want to delete does not exist',
				);
			});
		this.instituteRepository.remove(institute);
	}

	async getLessonsByInstitute(id: number): Promise<Lesson[]> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute.lessons;
	}
}
