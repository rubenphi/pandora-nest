import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Course } from './course.entity';
import { Area } from '../areas/area.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	CreateCourseDto,
	UpdateCourseDto,
	AddAreaToCourseDto,
	DeleteAreaFromCourseDto,
	QueryCourseDto,
} from './dto';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';
import { AddUserToCourseDto } from './dto/add-user.dto';
import { UserToCourse } from '../users/userToCourse.entity';
import { RemoveUserFromCourseDto } from './dto/remove-users.dto';
import { QueryUsersOfCourseDto } from './dto/query-user.dto';

@Injectable()
export class CoursesService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getCourses(queryCourse: QueryCourseDto): Promise<Course[]> {
		if (queryCourse) {
			return await this.courseRepository.find({
				where: { name: queryCourse.name, exist: queryCourse.exist, institute: { id: queryCourse.instituteId }  },
				relations: ['institute'],
			});
		} else {
			return await this.courseRepository.find({ relations: ['institute'] });
		}
	}
	async getCourse(id: number, user: User): Promise<Course> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see a course');
		}

		return course;
	}
	async createCourse(courseDto: CreateCourseDto, user: User): Promise<Course> {
		if (user.rol !== Role.Admin && user.institute.id !== courseDto.instituteId) {
			throw new ForbiddenException('You are not allowed to create this course');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: courseDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const course: Course = await this.courseRepository.create({
			name: courseDto.name,
			institute,
			exist: courseDto.exist,
		});
		return this.courseRepository.save(course);
	}
	async updateCourse(
		id: number,
		courseDto: UpdateCourseDto,
		user: User,
	): Promise<Course> {
		if (user.rol !== Role.Admin && user.institute.id !== courseDto.instituteId) {
			throw new ForbiddenException('You are not allowed to update this course');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: courseDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const course: Course = await this.courseRepository.preload({
			id: id,
			name: courseDto.name,
			institute,
			exist: courseDto.exist,
		});
		if (!course) {
			throw new NotFoundException(
				'The course you want to update does not exist',
			);
		}
		return this.courseRepository.save(course);
	}

	async deleteCourse(id: number): Promise<void> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The course you want to delete does not exist',
				);
			});
		this.courseRepository.remove(course);
	}

	async addAreaToCourse(
		id: number,
		courseAreas: AddAreaToCourseDto,
		user: User,
	): Promise<any> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to add areas to this course',
			);
		}
		const areas: Area[] = await this.areaRepository.find({
			where: { id: In(courseAreas.areasId) },
		});

		course.areas = course.areas.concat(areas);

		return this.courseRepository.save(course);
	}

	async deleteAreaFromCourse(
		id: number,
		courseAreas: DeleteAreaFromCourseDto,
		user: User,
	): Promise<any> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['areas'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to delete areas to this course',
			);
		}

		courseAreas.areasId.forEach((areaId) => {
			course.areas = course.areas.filter((area) => {
				return area.id !== areaId;
			});
		});

		return this.courseRepository.save(course);
	}

	async getAreasByCourse(id: number, user: User): Promise<Area[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['areas', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see areas of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see areas of this course',
				);
			}
		}

		return course.areas;
	}

	async getLessonsByCourse(id: number, user: User): Promise<Lesson[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see lessons of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see lessons of this course',
				);
			}
		}

		return course.lessons;
	}

	async getGroupsByCourse(id: number, user: User): Promise<Group[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['groups'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see groups of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see groups of this course',
				);
			}
		}

		return course.groups;
	}

	async getUsersByCourse(
		id: number,
		user: User,
		queryUser: QueryUsersOfCourseDto,
	): Promise<UserToCourse[]> {
		const course: Course = await this.courseRepository.findOneOrFail({
			where: { id },
			relations: ['institute'],
		});
		const users: UserToCourse[] = await this.userToCourseRepository.find({
			where: { course: { id }, year: queryUser.year },
			relations: ['user'],
		});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see this course');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(course) =>
					course.id === course.course.id && course.year === course.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this course');
			}
		}
		return users;
	}
	async addUserToCourse(
		id: number,
		usersToAdd: AddUserToCourseDto[],
		user: User,
	) {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to add users to this course',
			);
		}

		if (
			await this.userToCourseRepository.findOne({
				where: usersToAdd.map((userToAdd) => ({
					user: { id: userToAdd.userId },
					year: userToAdd.year,
				})),
			})
		) {
			throw new BadRequestException('User already belongs to this group');
		}

		const usersToAddIncourse: User[] = await this.userRepository.find({
			where: { id: In(usersToAdd.map((userToAdd) => userToAdd.userId)) },
		});

		const usersToCourse: UserToCourse[] = await Promise.all(
			usersToAdd.map(async (userToAdd) => {
				const userToCourse: UserToCourse = this.userToCourseRepository.create({
					user: usersToAddIncourse.find((user) => user.id === userToAdd.userId),
					course,
					rol: userToAdd.rol,
					year: userToAdd.year,
				});
				return userToCourse;
			}),
		);

		return this.userToCourseRepository.save(usersToCourse);
	}
	async removeUserFromCourse(
		id: number,
		userToRemove: RemoveUserFromCourseDto,
		user: User,
	): Promise<UserToCourse> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to delete users to this course',
			);
		}

		const userToDelete: User = await this.userRepository
			.findOneOrFail({
				where: { id: userToRemove.userIdToRemove },
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});

		const userToDeleteFromCourse: UserToCourse =
			await this.userToCourseRepository.findOneOrFail({
				where: {
					user: { id: userToDelete.id },
					course: { id: course.id },
					year: userToRemove.year,
				},
			});

		await this.userToCourseRepository.remove(userToDeleteFromCourse);

		return userToDeleteFromCourse;
	}
}
