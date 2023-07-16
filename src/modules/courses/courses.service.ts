import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class CoursesService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getCourses(queryCourse: QueryCourseDto): Promise<Course[]> {
		if (queryCourse) {
			return await this.courseRepository.find({
				where: { name: queryCourse.name, exist: queryCourse.exist },
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
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException('You are not allowed to see a course');
		}

		return course;
	}
	async createCourse(courseDto: CreateCourseDto, user: User): Promise<Course> {
		if (user.institute.id !== courseDto.instituteId) {
			throw new NotFoundException('You are not allowed to create this course');
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
		if (user.institute.id !== courseDto.instituteId) {
			throw new NotFoundException('You are not allowed to update this course');
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
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException(
				'You are not allowed to add areas to this course',
			);
		}
		const areas: Area[] = await this.areaRepository.find({
			where: { id: In(courseAreas.areasId) },
		});

		course.areas = areas;

		return this.courseRepository.save(course);
	}

	async deleteAreaToCourse(
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
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException(
				'You are not allowed to delete areas to this course',
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
				relations: ['areas'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException(
				'You are not allowed to see areas of this course',
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
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException(
				'You are not allowed to see lessons of this course',
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
		if (user.institute.id !== course.institute.id) {
			throw new NotFoundException(
				'You are not allowed to see groups of this course',
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
}
