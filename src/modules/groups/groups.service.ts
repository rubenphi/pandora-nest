import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Group } from './group.entity';
import { CreateGroupDto, QueryGroupDto, UpdateGroupDto } from './dto';
import { Course } from '../courses/course.entity';
import { Answer } from '../answers/answer.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';
import { UserToGroup } from '../users/userToGroup.entity';
import { Period } from '../periods/period.entity';
import { AddUserToGroupDto } from './dto/add-user.dto';
import { RemoveUserFromGroupDto } from './dto/remove-users.dto';

@Injectable()
export class GroupsService {
	constructor(
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(UserToGroup)
		private readonly userToGroupRepository: Repository<UserToGroup>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getGroups(queryGroup: QueryGroupDto, user: User): Promise<Group[]> {
		if (queryGroup) {
			return await this.groupRepository.find({
				where: {
					name: queryGroup.name,
					course: { id: queryGroup.courseId },
					period: { id: queryGroup.periodId },
					year: queryGroup.year,
					exist: queryGroup.exist,
					institute: { id: user.rol == Role.Admin ? queryGroup.instituteId : user.institute.id }
				},
				relations: ['course', 'institute', 'period'],
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
				relations: ['course', 'institute', 'period'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== group.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(course) => course.id === group.course.id && course.year === group.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this group');
			}
		}
		return group;
	}
	async createGroup(groupDto: CreateGroupDto, user: User): Promise<Group> {
		if (user.rol !== Role.Admin && user.institute.id !== groupDto.instituteId) {
			throw new ForbiddenException('You are not allowed to create this group');
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
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id: groupDto.periodId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		const group: Group = await this.groupRepository.create({
			name: groupDto.name,
			institute,
			course,
			period,
			year: groupDto.year,
			exist: groupDto.exist,
			active: groupDto.active
		});
		return this.groupRepository.save(group);
	}
	async updateGroup(
		id: number,
		groupDto: UpdateGroupDto,
		user: User,
	): Promise<Group> {
		if (user.rol !== Role.Admin && user.institute.id !== groupDto.instituteId) {
			throw new ForbiddenException('You are not allowed to update this group');
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
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id: groupDto.periodId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		const group: Group = await this.groupRepository.preload({
			id: id,
			name: groupDto.name,
			institute,
			course,
			year: groupDto.year,
			period,
			exist: groupDto.exist,
			active: groupDto.active
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
		if (user.rol !== Role.Admin && user.institute.id !== group.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(course) => course.id === group.course.id && course.year === group.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this group');
			}
		}
		return group.answers;
	}

	async getUsersByGroup(id: number, user: User): Promise<UserToGroup[]> {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['users'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== group.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(course) => course.id === group.course.id && course.year === group.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this group');
			}
		}
		return group.userToGroups;
	}

	async addUserToGroup(
		id: number,
		usersToAdd: AddUserToGroupDto[],
		user: User,
	) {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== group.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}

		const usersToAddInGroup: User[] = await this.userRepository.find({
			where: { id: In(usersToAdd.map((userToAdd) => userToAdd.userId)) },
		});

		const usersToGroup: UserToGroup[] = await Promise.all(
			usersToAdd.map(async (userToAdd) => {
				const userToGroup: UserToGroup = this.userToGroupRepository.create({
					user: usersToAddInGroup.find((user) => user.id === userToAdd.userId),
					group,
				});
				return userToGroup;
			}),
		);
		return this.userToGroupRepository.save(usersToGroup);
	}

	async removeUserFromGroup(
		id: number,
		usersToRemove: RemoveUserFromGroupDto,
		user: User,
	) {
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== group.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}

		const userToRemove: User = await this.userRepository
			.findOneOrFail({
				where: { id: usersToRemove.userIdToRemove },
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});

		const userToRemoveFromGroup: UserToGroup =
			await this.userToGroupRepository.findOneOrFail({
				where: {
					user: { id: userToRemove.id },
					group: { id: group.id },
				},
			});

		await this.userToGroupRepository.remove(userToRemoveFromGroup);

		return userToRemoveFromGroup;
	}
}
