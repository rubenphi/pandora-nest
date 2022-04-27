import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Course } from './course.entity';
import { Area } from '../areas/area.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
import { CreateCourseDto, UpdateCourseDto, AddAreaToCourseDto, DeleteAreaFromCourseDto } from './dto';

@Injectable()
export class CoursesService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
	) {}

	async getCourses(): Promise<Course[]> {
		return await this.courseRepository.find();
	}
	async getCourse(id: number): Promise<Course> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id }
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		return course;
	}
	async createCourse(courseDto: CreateCourseDto): Promise<Course> {
		const course: Course = await this.courseRepository.create(courseDto);
		return this.courseRepository.save(course);
	}
	async updateCourse(id: number, courseDto: UpdateCourseDto): Promise<Course> {
		const course: Course = await this.courseRepository.preload({
			id: id,
			name: courseDto.name,
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

	async addAreaToCourse(id: number, courseAreas: AddAreaToCourseDto): Promise<any> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		const areas: Area[] = await this.areaRepository
			.find({
				where: { id: In(courseAreas.areasId) },
			})

		course.areas = areas;

		return this.courseRepository.save(course);
	}

	async deleteAreaToCourse(id:number, courseAreas: DeleteAreaFromCourseDto): Promise<any> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['areas'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		
		courseAreas.areasId.forEach( areaId => {
			course.areas = course.areas.filter( area => { 
				return area.id !== areaId
			 })
		});
		
		return this.courseRepository.save(course);
	}

	async getAreasByCourse(id: number): Promise<Area[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['areas'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		return course.areas;
	}

	async getLessonsByCourse(id: number): Promise<Lesson[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		return course.lessons;
	}

	async getGroupsByCourse(id: number): Promise<Group[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['groups'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		return course.groups;
	}
}
