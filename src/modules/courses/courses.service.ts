import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './course.entity';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Injectable()
export class CoursesService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
	) {}

	async getCourses(): Promise<Course[]> {
		return await this.courseRepository.find();
	}
	async getCourse(id: number): Promise<Course> {
		const course: Course = await this.courseRepository.findOne({
			where: { id: id },
			relations: ['groups'],
		});
		if (!course) {
			throw new NotFoundException('Course not found');
		}
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
			throw new NotFoundException('The course you want to update does not exist');
		}
		return this.courseRepository.save(course);
	}

	async deleteCourse(id: number): Promise<void> {
		const course: Course = await this.courseRepository.findOne({
			where: { id: id },
		});
		if (!course) {
			throw new NotFoundException('The course you want to delete does not exist');
		}
		this.courseRepository.remove(course);
	}
}
