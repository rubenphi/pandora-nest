import { Answer } from '../answers/answer.entity';
import { Option } from '../options/option.entity';
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Quiz } from './quiz.entity';
import { CreateQuizDto, UpdateQuizDto, QueryQuizDto } from './dto'; // Assuming these DTOs will be created
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';
import { Question } from '../questions/question.entity'; // Needed for relations
import { ActivitiesService } from '../activities/activities.service';
import { MaterialsService } from '../materials/materials.service';
import { ContentType } from '../lesson-items/lesson-item.entity';
import { LessonItem } from '../lesson-items/lesson-item.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { Period } from '../periods/period.entity';
import { ImportFromLessonDto } from '../lessons/dto/import-from-lesson.dto'; // New import
import { ImportQuestionsMixDto } from '../lessons/dto/import-from-lesson-mix.dto'; // New import
import { ResultLessonDto } from '../lessons/dto/result-lesson.dto'; // New import

@Injectable()
export class QuizzesService {
	constructor(
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Answer) // New injection
		private readonly answerRepository: Repository<Answer>,
		@InjectRepository(Option) // New injection
		private readonly optionRepository: Repository<Option>,
		private readonly activitiesService: ActivitiesService,
		private readonly materialsService: MaterialsService,
	) {}

	async findOne(id: number): Promise<Quiz> {
		return this.quizRepository.findOne({
			where: { id },
			relations: ['questions', 'questions.options'],
		});
	}

	// Replicating getLessons as getQuizzes
	async getQuizzes(queryQuiz: QueryQuizDto): Promise<Quiz[]> {
		if (queryQuiz) {
			return await this.quizRepository.find({
				where: {
					title: queryQuiz.title,
					quizType: queryQuiz.quizType,
					lesson: {
						id: queryQuiz.lessonId,
						course: { id: queryQuiz.courseId },
						period: { id: queryQuiz.periodId },
						year: queryQuiz.year,
						exist: queryQuiz.exist,
					},
					institute: { id: queryQuiz.instituteId },
				},
				relations: ['lesson', 'institute', 'lesson.course', 'lesson.period'],
			});
		} else {
			return await this.quizRepository.find({
				relations: ['lesson', 'institute', 'lesson.course', 'lesson.period'],
			});
		}
	}

	// Replicating getLesson as getQuiz
	async getQuiz(id: number, user: User): Promise<Quiz> {
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'lesson',
					'lesson.author',
					'lesson.institute',
					'lesson.course',
					'lesson.area',
					'lesson.period',
					'questions',
					'questions.options',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});

		if (user.institute.id !== quiz.lesson.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}

		return quiz;
	}

	// Replicating createLesson as createQuiz
	async createQuiz(quizDto: CreateQuizDto, user: User): Promise<Quiz> {
		if (user.institute.id !== quizDto.instituteId) {
			throw new ForbiddenException(
				'You are not allowed to create a quiz for this institute',
			);
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: quizDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: quizDto.lessonId },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});

		const quiz: Quiz = await this.quizRepository.create({
			title: quizDto.title,
			quizType: quizDto.quizType,
			lesson,
			institute,
		});
		return this.quizRepository.save(quiz);
	}

	// Replicating updateLesson as updateQuiz
	async updateQuiz(
		id: number,
		quizDto: UpdateQuizDto,
		user: User,
	): Promise<Quiz> {
		if (user.institute.id !== quizDto.instituteId) {
			throw new ForbiddenException('You are not allowed to update this quiz');
		}

		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: quizDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: quizDto.lessonId },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});

		const quiz: Quiz = await this.quizRepository.preload({
			id,
			title: quizDto.title,
			quizType: quizDto.quizType,
			lesson,
			institute,
		});

		if (!quiz) {
			throw new NotFoundException('The quiz you want to update does not exist');
		}
		return this.quizRepository.save(quiz);
	}

	// Replicating deleteLesson as deleteQuiz
	async deleteQuiz(id: number, user: User): Promise<void> {
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				relations: ['lesson', 'lesson.institute'],
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The quiz you want to delete does not exist',
				);
			});
		if (user.institute.id !== quiz.lesson.institute.id) {
			throw new ForbiddenException('You are not allowed to delete this quiz');
		}
		this.quizRepository.remove(quiz);
	}

	async getQuizQuestions(id: number, user: User): Promise<Question[]> {
		const quiz = await this.getQuiz(id, user);
		return quiz.questions;
	}

	async getAnswersByQuiz(id: number, user: User): Promise<Answer[]> {
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'answers',
					'answers.option',
					'answers.question',
					'answers.group',
					'answers.option',
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		if (user.institute.id !== quiz.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}
		return quiz.answers;
	}

	async getResultQuiz(id: number, user: User): Promise<ResultLessonDto[]> {
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'answers',
					'answers.option',
					'answers.question',
					'answers.group',
					'answers.user',
					'answers.option',
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		if (user.institute.id !== quiz.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}

		const resultQuiz = [];

		if (quiz.quizType === 'individual') {
			quiz.answers.reduce((res, value) => {
				if (!res[value.user.id]) {
					res[value.user.id] = { user: value.user, points: 0 };
					resultQuiz.push(res[value.user.id]);
				}
				if (typeof value.points === 'number') {
					value.points = value.points;
				} else {
					value.points = parseFloat(value.points);
				}
				res[value.user.id].points += value.points;

				return res;
			}, {});
		}

		if (quiz.quizType === 'group') {
			quiz.answers.reduce((res, value) => {
				if (!res[value.group.id]) {
					res[value.group.id] = { group: value.group, points: 0 };
					resultQuiz.push(res[value.group.id]);
				}
				if (typeof value.points === 'number') {
					value.points = value.points;
				} else {
					value.points = parseFloat(value.points);
				}
				res[value.group.id].points += value.points;

				return res;
			}, {});
		}
		return resultQuiz.sort((a, b) => b.points - a.points);
	}

	async importQuestionsToQuiz(
		id: number,
		importFromQuizDto: ImportFromLessonDto,
	): Promise<Question[]> {
		const fromQuiz: Quiz = await this.quizRepository
			.findOneOrFail({
				relations: ['questions', 'questions.options'],
				where: { id: importFromQuizDto.fromLessonId },
			})
			.catch(() => {
				throw new NotFoundException('Quiz origin not found');
			});

		const toQuiz: Quiz = await this.quizRepository
			.findOneOrFail({
				relations: ['questions', 'institute'],
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Quiz destiny not found');
			});

		if (toQuiz.questions.length) {
			throw new BadRequestException(
				`You can only import options to a question that doesn't have them`,
			);
		} else {
			// Copiar y ordenar las preguntas por ID
			const questions = [...fromQuiz.questions].sort((a, b) => a.id - b.id);

			for (const question of questions) {
				try {
					const questionToSave: Question = this.questionRepository.create({
						available: false,
						exist: question.exist,
						institute: toQuiz.institute,
						quiz: toQuiz,
						sentence: question.sentence,
						photo: question.photo,
						points: question.points,
						title: question.title,
						visible: false,
					});

					const questionSaved = await this.questionRepository.save(
						questionToSave,
					);

					for (const option of question.options.sort((a, b) => a.id - b.id)) {
						const optionToSave: Option = this.optionRepository.create({
							correct: option.correct,
							exist: option.exist,
							question: questionSaved,
							sentence: option.sentence,
							identifier: option.identifier,
							institute: toQuiz.institute,
						});

						await this.optionRepository.save(optionToSave);
					}
				} catch (error) {
					if (error instanceof QueryFailedError) {
						const errorCode = (error as any).code;

						switch (errorCode) {
							case '23505': // PostgreSQL
							case '1062': // MySQL y MariaDB
								throw new ConflictException('Este registro ya existe.');
							default:
								throw new InternalServerErrorException('Database error.');
						}
					} else {
						throw new InternalServerErrorException('Unknown error.');
					}
				}
			}

			// Devuelve las preguntas de la nueva lección
			return (
				await this.quizRepository.findOne({
					relations: ['questions.quiz'],
					where: { id },
				})
			).questions;
		}
	}

	async importQuestionsToQuizMix(
		dto: ImportQuestionsMixDto,
	): Promise<Question[]> {
		const toQuiz = await this.quizRepository.findOneOrFail({
			where: { id: dto.toLessonId },
			relations: ['questions', 'institute'],
		});

		for (const { id, title } of dto.questions) {
			// Verifica si ya existe una pregunta con el mismo título en la lección destino
			const alreadyExists = await this.questionRepository.findOne({
				where: {
					quiz: { id: dto.toLessonId },
					title,
				},
			});

			if (alreadyExists) {
				continue; // Evita duplicación
			}

			// Consulta la pregunta original con sus opciones
			const question = await this.questionRepository.findOneOrFail({
				where: { id },
				relations: ['options'],
			});

			// Crea una nueva pregunta con campos válidos
			const newQuestion = this.questionRepository.create({
				title,
				sentence: question.sentence,
				points: question.points,
				photo: question.photo,
				quiz: toQuiz,
				institute: toQuiz.institute,
				visible: false,
				available: false,
				exist: true,
			});

			const savedQuestion = await this.questionRepository.save(newQuestion);

			// Crea nuevas opciones solo con campos válidos
			for (const option of question.options) {
				const newOption = this.optionRepository.create({
					identifier: option.identifier,
					sentence: option.sentence,
					correct: option.correct,
					exist: true,
					question: savedQuestion,
					institute: toQuiz.institute,
				});

				await this.optionRepository.save(newOption);
			}
		}

		// Cargar las preguntas con sus opciones asociadas
		const updatedQuiz = await this.quizRepository.findOneOrFail({
			where: { id: dto.toLessonId },
			relations: ['questions', 'questions.options'],
		});

		return updatedQuiz.questions;
	}

	async getPointsByQuiz(id: number, user: User): Promise<{ points: number }> {
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute', 'questions'],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		if (user.institute.id !== quiz.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}

		const points = quiz.questions.reduce((res, value) => res + value.points, 0);

		return { points };
	}
}
