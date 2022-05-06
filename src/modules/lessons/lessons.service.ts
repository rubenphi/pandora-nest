import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
	CreateLessonDto,
	UpdateLessonDto,
	QueryLessonDto,
	ResultLessonDto,
} from './dto';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { Answer } from '../answers/answer.entity';
import { Question } from '../questions/question.entity';
import { Area } from '../areas/area.entity';

@Injectable()
export class LessonsService {
	constructor(
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
	) {}

	async getLessons(queryLesson: QueryLessonDto): Promise<Lesson[]> {
		if (queryLesson) {
			return await this.lessonRepository.find({
				where: {
					course: { id: queryLesson.courseId },
					area: { id: queryLesson.areaId },
					theme: queryLesson.theme,
					date: queryLesson.date,
					exist: queryLesson.exist,
				},
				relations: ['course', 'area'],
			});
		} else {
			return await this.lessonRepository.find({
				relations: ['course', 'area'],
			});
		}
	}

	async getLesson(id: number): Promise<Lesson> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'area'],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		return lesson;
	}
	async createLesson(lessonDto: CreateLessonDto): Promise<Lesson> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: lessonDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id: lessonDto.areaId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const lesson: Lesson = await this.lessonRepository.create({
			theme: lessonDto.theme,
			date: lessonDto.date,
			course,
			area,
			exist: lessonDto.exist,
		});
		return this.lessonRepository.save(lesson);
	}
	async updateLesson(id: number, lessonDto: UpdateLessonDto): Promise<Lesson> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: lessonDto.courseId },
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
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The lesson you want to delete does not exist',
				);
			});
		this.lessonRepository.remove(lesson);
	}

	async getAnswersByLesson(id: number): Promise<Answer[]> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'answers',
					'answers.option',
					'answers.question',
					'answers.group',
					'answers.option',
				],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		return lesson.answers;
	}

	async getQuestionsByLesson(id: number): Promise<Question[]> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: ['questions', 'questions.lesson'],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		return lesson.questions;
	}

	async getResultLesson(id: number): Promise<ResultLessonDto[]> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'answers',
					'answers.option',
					'answers.question',
					'answers.group',
					'answers.option',
				],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		const resultLesson = [];
		lesson.answers.reduce((res, value) => {
			if (!res[value.group.id]) {
				res[value.group.id] = { group: value.group, points: 0 };
				resultLesson.push(res[value.group.id]);
			}
			res[value.group.id].points += value.points;
			return res;
		}, {});
		return resultLesson.sort((a, b) => b.points - a.points);
	}
}
