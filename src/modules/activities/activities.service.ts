import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';

@Injectable()
export class ActivitiesService {
	constructor(
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
	) {}

	async findOne(id: number): Promise<Activity> {
		return this.activityRepository.findOne({
			where: { id },
			relations: ['criteria'],
		});
	}
}
