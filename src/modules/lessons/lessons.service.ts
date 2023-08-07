import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
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
import { Institute } from '../institutes/institute.entity';
import { ImportFromLessonDto } from './dto/import-from-lesson.dto';
import { Option } from '../options/option.entity';
import { User } from '../users/user.entity';
import { userInfo } from 'os';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class LessonsService {
	constructor(
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
	) {}

	async getLessons(queryLesson: QueryLessonDto): Promise<Lesson[]> {
		if (queryLesson) {
			return await this.lessonRepository.find({
				where: {
					year: queryLesson.year,
					course: { id: queryLesson.courseId },
					area: { id: queryLesson.areaId },
					topic: queryLesson.topic,
					date: queryLesson.date,
					exist: queryLesson.exist,
				},
				relations: ['course', 'area', 'institute'],
			});
		} else {
			return await this.lessonRepository.find({
				relations: ['course', 'area'],
			});
		}
	}

	async getLesson(id: number, user: User): Promise<Lesson> {
		
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'area'],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
			if (user.institute.id !== lesson.institute.id) {
				throw new ForbiddenException('You are not allowed to see this group');
			}
		return lesson;
	}
	async createLesson(lessonDto: CreateLessonDto, user: User): Promise<Lesson> {
		if(user.institute.id !== lessonDto.instituteId){
			throw new ForbiddenException('You are not allowed to create a lesson for this institute');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: lessonDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
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
				throw new NotFoundException('Area not found');
			});

		const lesson: Lesson = await this.lessonRepository.create({
			year: lessonDto.year,
			topic: lessonDto.topic,
			date: lessonDto.date,
			institute,
			course,
			area,
			exist: lessonDto.exist,
		});
		return this.lessonRepository.save(lesson);
	}
	async updateLesson(id: number, lessonDto: UpdateLessonDto, user: User): Promise<Lesson> {
		if(user.institute.id !== lessonDto.instituteId){
			throw new ForbiddenException('You are not allowed to update this lesson');
		}

		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: lessonDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id: lessonDto.courseId },
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		const lesson: Lesson = await this.lessonRepository.preload({
			year: lessonDto.year,
			id: id,
			topic: lessonDto.topic,
			date: lessonDto.date,
			institute,
			course,
			exist: lessonDto.exist,
		});
		if(user.rol !== Role.Admin && user.id !== lesson.author.id){
			throw new ForbiddenException('You are not allowed to update this lesson');
		}
		if (!lesson) {
			throw new NotFoundException(
				'The lesson you want to update does not exist',
			);
		}
		return this.lessonRepository.save(lesson);
	}

	async deleteLesson(id: number, user: User): Promise<void> {

		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The lesson you want to delete does not exist',
				);
			});
			if(user.institute.id !== lesson.institute.id){
				throw new ForbiddenException('You are not allowed to delete this lesson');
			}
			if(user.rol !== Role.Admin && user.id !== lesson.author.id){
				throw new ForbiddenException('You are not allowed to update this lesson');
			}
		this.lessonRepository.remove(lesson);
	}

	async getAnswersByLesson(id: number, user: User): Promise<Answer[]> {
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
			if(user.institute.id !== lesson.institute.id){
				throw new ForbiddenException('You are not allowed to see this lesson');
			}
		return lesson.answers;
	}

	async getQuestionsByLesson(id: number, user: User): Promise<Question[]> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: ['questions', 'questions.lesson'],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
			if(user.institute.id !== lesson.institute.id){
				throw new ForbiddenException('You are not allowed to see this lesson');
			}
		return lesson.questions;
	}

	async getResultLesson(id: number, user: User): Promise<ResultLessonDto[]> {
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
			if(user.institute.id !== lesson.institute.id){
				throw new ForbiddenException('You are not allowed to see this lesson');
			}
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

	async importQuestionsToLesson(
		id: number,
		importFromLessonDto: ImportFromLessonDto,
	): Promise<Question[]> {
		const fromLesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				relations: ['questions', 'questions.options'],
				where: { id: importFromLessonDto.fromLessonId },
			})
			.catch(() => {
				throw new NotFoundException('Question origin not found');
			});

		const toLesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				relations: ['questions', 'institute'],
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Question destiny not found');
			});
		if (toLesson.questions.length) {
			throw new BadRequestException(
				`You can only import options to a question that doesn't have them`,
			);
		} else {
			for (const question of fromLesson.questions) {
				const questionToSave: Question = this.questionRepository.create({
					available: question.available,
					exist: question.exist,
					institute: toLesson.institute,
					lesson: toLesson,
					sentence: question.sentence,
					photo: question.photo,
					points: question.points,
					title: question.title,
					visible: question.visible,
				});

				const savedQuestion = await this.questionRepository.save(
					questionToSave,
				);
				question.options.forEach(async (option) => {
					const optionToSave: Option = this.optionRepository.create({
						correct: option.correct,
						exist: option.exist,
						question: savedQuestion,
						sentence: option.sentence,
						identifier: option.identifier,
						institute: toLesson.institute,
					});
					await this.optionRepository.save(optionToSave);
				});
			}

			return (
				await this.lessonRepository.findOne({
					relations: ['questions.lesson'],
					where: { id },
				})
			).questions;
		}
	}
}
