import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Group } from './group.entity';
import { CreateGroupDto, QueryGroupDto, UpdateGroupDto } from './dto';
import { Course } from '../courses/course.entity';
import { Answer } from '../answers/answer.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getGroups(queryGroup: QueryGroupDto): Promise<Group[]> {
		if (queryGroup) {
			return await this.groupRepository.find({
				where: {
					name: queryGroup.name,
					course: { id: queryGroup.courseId },
					year: queryGroup.year,
					exist: queryGroup.exist,
				},
				relations: ['course', 'institute'],
			});
		} else {
			return await this.groupRepository.find({
				relations: ['course', 'institute'],
			});
		}
	}

	async getGroup(id: number, user: User): Promise<Group> {
	
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
			if(user.institute.id !== group.institute.id){
				throw new NotFoundException('You are not allowed to see this group');
			}
		if(user.rol === Role.Student){
			const studentInSameCourse =  user.courses.find(course => 
				course.id === group.course.id && course.year === group.year)
			if(!studentInSameCourse){
				throw new NotFoundException('You are not allowed to see this group');
			}
		}
		return group;
	}
	async createGroup(groupDto: CreateGroupDto, user: User): Promise<Group> {
		if(user.institute.id !== groupDto.instituteId){
			throw new NotFoundException('You are not allowed to create this group');
		}
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: groupDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: groupDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const group: Group = await this.groupRepository.create({
			name: groupDto.name,
			institute,
			course: course,
			year: groupDto.year,
			exist: groupDto.exist,
		});
		return this.groupRepository.save(group);
	}
	async updateGroup(id: number, groupDto: UpdateGroupDto, user: User): Promise<Group> {
		if(user.institute.id !== groupDto.instituteId){
			throw new NotFoundException('You are not allowed to update this group');
		}
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: groupDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: groupDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const group: Group = await this.groupRepository.preload({
			id: id,
			name: groupDto.name,
			institute,
			year: groupDto.year,
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
	async getAnswersByGroup(id: number, user: User): Promise<Answer[]> {
		
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['answers'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
			if(user.institute.id !== group.institute.id){
				throw new NotFoundException('You are not allowed to see this group');
			}
			if(user.rol === Role.Student){
				const studentInSameCourse =  user.courses.find(course => 
					course.id === group.course.id && course.year === group.year)
				if(!studentInSameCourse){
					throw new NotFoundException('You are not allowed to see this group');
				}
			}
		return group.answers;
	}
}
