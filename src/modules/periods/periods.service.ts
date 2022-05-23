import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Period } from './period.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	CreatePeriodDto,
	UpdatePeriodDto,
	QueryPeriodDto,
} from './dto';

@Injectable()
export class PeriodsService {
	constructor(
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
	) {}

	async getPeriods(queryPeriod: QueryPeriodDto): Promise<Period[]> {
		if (queryPeriod) {
			return await this.periodRepository.find({
				where: { name: queryPeriod.name, exist: queryPeriod.exist },
			});
		} else {
			return await this.periodRepository.find();
		}
	}
	async getPeriod(id: number): Promise<Period> {
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		return period;
	}
	async createPeriod(periodDto: CreatePeriodDto): Promise<Period> {
		const period: Period = await this.periodRepository.create(periodDto);
		return this.periodRepository.save(period);
	}
	async updatePeriod(id: number, periodDto: UpdatePeriodDto): Promise<Period> {
		const period: Period = await this.periodRepository.preload({
			id: id,
			name: periodDto.name,
			exist: periodDto.exist,
		});
		if (!period) {
			throw new NotFoundException(
				'The period you want to update does not exist',
			);
		}
		return this.periodRepository.save(period);
	}

	async deletePeriod(id: number): Promise<void> {
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The period you want to delete does not exist',
				);
			});
		this.periodRepository.remove(period);
	}

	async getLessonsByPeriod(id: number): Promise<Lesson[]> {
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		return period.lessons;
	}

}
