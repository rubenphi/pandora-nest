import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './course.entity';
import { Area } from '../areas/area.entity';
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
				where: { id: id },
				relations: ['groups','areas'],
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
				where: { id: id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The course you want to delete does not exist',
				);
			});
		this.courseRepository.remove(course);
	}

	async addAreaToCourse(courseArea: AddAreaToCourseDto): Promise<Course> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: courseArea.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id: courseArea.areaId },
			})
			.catch(() => {
				throw new NotFoundException('Area not found');
			});

		course.areas = [area];

		return this.courseRepository.save(course);
	}

	async deleteAreaToCourse(courseArea: DeleteAreaFromCourseDto): Promise<any> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: courseArea.courseId },
				relations: ['groups','areas'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		course.areas = course.areas.filter( area => { 
			return area.id !== courseArea.areaId
		 });

		return this.courseRepository.save(course);
	}
}
