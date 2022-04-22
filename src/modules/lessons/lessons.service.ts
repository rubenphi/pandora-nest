import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLessonDto, UpdateLessonDto } from './dto';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';

@Injectable()
export class LessonsService {
	constructor(
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
	) {}

	async getLessons(): Promise<Lesson[]> {
		return await this.lessonRepository.find({ relations: ['course'] });
	}

	async getLessonsByCourse(id: number): Promise<Lesson[]> {
		return await this.lessonRepository.find({ where: {course: {id: id}}, relations: ['course'] });
	}

	async getLessonsByCourseAndArea(courseId: number, areaId: number): Promise<Lesson[]> {
		return await this.lessonRepository.find({ where: {course: {id: courseId}, area: {id: areaId}}, relations: ['course'] });
	}

	async getLesson(id: number): Promise<Lesson> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: id },
				relations: ['course'],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		return lesson;
	}
	async createLesson(lessonDto: CreateLessonDto): Promise<Lesson> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: lessonDto.course_id },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const lesson: Lesson = await this.lessonRepository.create({
			theme: lessonDto.theme,
			date: lessonDto.date,
			course,
			exist: lessonDto.exist,
		});
		return this.lessonRepository.save(lesson);
	}
	async updateLesson(id: number, lessonDto: UpdateLessonDto): Promise<Lesson> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: lessonDto.course_id },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const lesson: Lesson = await this.lessonRepository.preload({
			id: id,
			theme: lessonDto.theme,
			date: lessonDto.date,
			course,
			exist: lessonDto.exist,
		});
		if (!lesson) {
			throw new NotFoundException(
				'The lesson you want to update does not exist',
			);
		}
		return this.lessonRepository.save(lesson);
	}

	async deleteLesson(id: number): Promise<void> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The lesson you want to delete does not exist',
				);
			});
		this.lessonRepository.remove(lesson);
	}
}
