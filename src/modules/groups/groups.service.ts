import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from './group.entity';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { Course } from '../courses/course.entity';
import { Answer } from '../answers/answer.entity';

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
	) {}

	async getGroups(): Promise<Group[]> {
		return await this.groupRepository.find({ relations: ['course'] });
	}

	async getGroup(id: number): Promise<Group> {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['course'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		return group;
	}
	async createGroup(groupDto: CreateGroupDto): Promise<Group> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: groupDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const group: Group = await this.groupRepository.create({
			name: groupDto.name,
			course: course,
			exist: groupDto.exist,
		});
		return this.groupRepository.save(group);
	}
	async updateGroup(id: number, groupDto: UpdateGroupDto): Promise<Group> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: groupDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const group: Group = await this.groupRepository.preload({
			id: id,
			name: groupDto.name,
			course: course,
			exist: groupDto.exist,
		});
		if (!group) {
			throw new NotFoundException(
				'The group you want to update does not exist',
			);
		}
		return this.groupRepository.save(group);
	}

	async deleteGroup(id: number): Promise<void> {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The group you want to delete does not exist',
				);
			});
		this.groupRepository.remove(group);
	}
	async getAnswersByGroup(id: number): Promise<Answer[]> {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['answers'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		return group.answers;
	}
}
