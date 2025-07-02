import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Criterion } from './criterion.entity';
import {
	CreateCriterionDto,
	QueryCriterionDto,
	UpdateCriterionDto,
} from './dto';
import { User } from 'src/modules/users/user.entity';
import { Activity } from 'src/modules/activities/activity.entity';
import { Institute } from 'src/modules/institutes/institute.entity';

@Injectable()
export class CriteriaService {
	constructor(
		@InjectRepository(Criterion)
		private readonly criterionRepository: Repository<Criterion>,
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async create(
		createCriterionDto: CreateCriterionDto,
		user: User,
	): Promise<Criterion> {
		const activity = await this.activityRepository.findOne({
			where: { id: createCriterionDto.activityId },
		});

		if (!activity) {
			throw new NotFoundException(
				`Activity with ID ${createCriterionDto.activityId} not found`,
			);
		}

		let institute: Institute | undefined;
		if (createCriterionDto.instituteId) {
			institute = await this.instituteRepository.findOne({
				where: { id: createCriterionDto.instituteId },
			});
			if (!institute) {
				throw new NotFoundException(
					`Institute with ID ${createCriterionDto.instituteId} not found`,
				);
			}
		} else if (user.institute) {
			institute = user.institute;
		}

		const criterion = this.criterionRepository.create({
			...createCriterionDto,
			activity,
			institute,
		});
		return this.criterionRepository.save(criterion);
	}

	async findAll(query: QueryCriterionDto): Promise<Criterion[]> {
		const where: any = {
			activity: query.activityId ? { id: query.activityId } : undefined,
			institute: query.instituteId ? { id: query.instituteId } : undefined,
			description: query.description
				? ILike(`%${query.description}%`)
				: undefined,
		};

		return this.criterionRepository.find({
			where,
			relations: ['activity', 'institute'],
		});
	}

	async findOne(id: number): Promise<Criterion> {
		const criterion = await this.criterionRepository.findOne({
			where: { id },
			relations: ['activity', 'institute'],
		});
		if (!criterion) {
			throw new NotFoundException(`Criterion with ID ${id} not found`);
		}
		return criterion;
	}

	async update(
		id: number,
		updateCriterionDto: UpdateCriterionDto,
	): Promise<Criterion> {
		const criterion = await this.criterionRepository.findOneBy({ id });
		if (!criterion) {
			throw new NotFoundException(`Criterion with ID ${id} not found`);
		}

		let activity: Activity | undefined;
		if (updateCriterionDto.activityId) {
			activity = await this.activityRepository.findOne({
				where: { id: updateCriterionDto.activityId },
			});
			if (!activity) {
				throw new NotFoundException(
					`Activity with ID ${updateCriterionDto.activityId} not found`,
				);
			}
		}

		let institute: Institute | undefined;
		if (updateCriterionDto.instituteId) {
			institute = await this.instituteRepository.findOne({
				where: { id: updateCriterionDto.instituteId },
			});
			if (!institute) {
				throw new NotFoundException(
					`Institute with ID ${updateCriterionDto.instituteId} not found`,
				);
			}
		}

		const updatedCriterion = this.criterionRepository.merge(criterion, {
			...updateCriterionDto,
			activity: activity || criterion.activity,
			institute: institute || criterion.institute,
		});

		return this.criterionRepository.save(updatedCriterion);
	}

	async remove(id: number): Promise<void> {
		const result = await this.criterionRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Criterion with ID ${id} not found`);
		}
	}
}
