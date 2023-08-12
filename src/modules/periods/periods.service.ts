import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Period } from './period.entity';
import { Lesson } from '../lessons/lesson.entity';
import { CreatePeriodDto, UpdatePeriodDto, QueryPeriodDto } from './dto';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class PeriodsService {
	constructor(
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getPeriods(queryPeriod: QueryPeriodDto, user : User): Promise<Period[]> {
		if (queryPeriod) {
			return await this.periodRepository.find({
				where: { name: queryPeriod.name, exist: queryPeriod.exist, institute: { id: user.rol == Role.Admin ? queryPeriod.instituteId : user.institute.id } },
				relations: ['institute'],
			});
		} else {
			return await this.periodRepository.find({ relations: ['institute'] });
		}
	}
	async getPeriod(id: number, user: User): Promise<Period> {
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});
			if(user.institute.id !== period.institute.id)
				throw new ForbiddenException('You are not allowed to see this period',
				);

		return period;
	}
	async createPeriod(periodDto: CreatePeriodDto, user: User): Promise<Period> {
		if(user.institute.id !== periodDto.instituteId)
			throw new ForbiddenException('You are not allowed to create a period for this institute',
			);
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: periodDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const period: Period = await this.periodRepository.create({
			name: periodDto.name,
			institute,
			exist: periodDto.exist,
		});
		
		return this.periodRepository.save(period);
	}
	async updatePeriod(id: number, periodDto: UpdatePeriodDto, user: User): Promise<Period> {
		if(user.institute.id !== periodDto.instituteId)
			throw new ForbiddenException('You are not allowed to update this period',
			);
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: periodDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const period: Period = await this.periodRepository.preload({
			id: id,
			institute,
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

	async getLessonsByPeriod(id: number, user: User): Promise<Lesson[]> {
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

			if(user.institute.id !== period.institute.id)
				throw new ForbiddenException('You are not allowed to see this period',
				);
		

		return period.lessons;
	}
}
