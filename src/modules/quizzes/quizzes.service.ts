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
import {
	DataSource,
	In,
	Like,
	QueryFailedError,
	Repository,
	ILike,
} from 'typeorm';

import { Quiz } from './quiz.entity';
import { QuizScan } from './quiz-scan.entity';
import { FilesService } from '../files/files.service';
import {
	CreateQuizDto,
	UpdateQuizDto,
	QueryQuizDto,
	ImportFromQuizDto,
	ImportQuestionsMixDto,
} from './dto';
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
import { ResultLessonDto } from '../lessons/dto/result-lesson.dto';
import { Grade } from '../grades/grade.entity';
import {
	CourseAccessCheck,
	CourseAccessService,
} from 'src/common/authorization/course-access.service';

@Injectable()
export class QuizzesService {
	constructor(
		private readonly dataSource: DataSource,
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
		@InjectRepository(Grade)
		private readonly gradeRepository: Repository<Grade>,
		@InjectRepository(QuizScan)
		private readonly quizScanRepository: Repository<QuizScan>,
		private readonly filesService: FilesService,
		private readonly activitiesService: ActivitiesService,
		private readonly materialsService: MaterialsService,
		private readonly courseAccessService: CourseAccessService,
	) {}

	async findOne(id: number): Promise<Quiz> {
		return this.quizRepository.findOne({
			where: { id },
			relations: ['questions', 'questions.options', , 'institute'],
		});
	}

	// Replicating getLessons as getQuizzes
	async getQuizzes(queryQuiz: QueryQuizDto): Promise<Quiz[]> {
		if (queryQuiz) {
			return await this.quizRepository.find({
				where: {
					title: queryQuiz.title ? ILike(`%${queryQuiz.title}%`) : null,
					quizType: queryQuiz.quizType,
					category: queryQuiz.category,
					lesson: {
						id: queryQuiz.lessonId,
						course: queryQuiz.courseId ? { id: queryQuiz.courseId } : undefined,
						area: queryQuiz.areaId ? { id: queryQuiz.areaId } : undefined,
						period: queryQuiz.periodId ? { id: queryQuiz.periodId } : undefined,
						year: queryQuiz.year,
						exist: queryQuiz.exist,
					},
					institute: queryQuiz.instituteId ? { id: queryQuiz.instituteId } : undefined,
				},
				relations: [
					'lesson',
					'institute',
					'lesson.course',
					'lesson.period',
					'lesson.area',
				],
			});
		} else {
			return await this.quizRepository.find({
				relations: [
					'lesson',
					'institute',
					'lesson.course',
					'lesson.period',
					'lesson.area',
				],
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
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});

		if (user.institute.id !== quiz.lesson.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}
		await this.courseAccessService.assertQuizAccess(id, user);

		return quiz;
	}

	async getQuizAccess(id: number, user: User): Promise<CourseAccessCheck> {
		return this.courseAccessService.checkQuizAccess(id, user);
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
			evaluationType: quizDto.evaluationType,
			category: quizDto.category,
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
			evaluationType: quizDto.evaluationType,
			category: quizDto.category,
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
					'answers.user',
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		if (user.institute.id !== quiz.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}
		await this.courseAccessService.assertQuizAccess(id, user);

		const isStaff =
			user.rol === Role.Admin ||
			user.rol === Role.Teacher ||
			user.rol === Role.Director ||
			user.rol === Role.Coordinator;

		if (!isStaff) {
			// Para estudiantes, ocultar puntos y si fue correcta en preguntas que aún siguen abiertas
			return quiz.answers.map((ans) => {
				if (ans.question?.available !== false) {
					return {
						...ans,
						points: 0,
						option: ans.option
							? ({ id: ans.option.id, identifier: ans.option.identifier } as Option)
							: null,
					} as Answer;
				}
				return ans;
			});
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
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		if (user.institute.id !== quiz.institute.id) {
			throw new ForbiddenException('You are not allowed to see this quiz');
		}
		await this.courseAccessService.assertQuizAccess(id, user);

		const isStaff =
			user.rol === Role.Admin ||
			user.rol === Role.Teacher ||
			user.rol === Role.Director ||
			user.rol === Role.Coordinator;

		const resultQuiz = [];

		if (quiz.quizType === 'individual') {
			quiz.answers.reduce((res, value) => {
				if (!res[value.user.id]) {
					res[value.user.id] = { user: value.user, points: 0 };
					resultQuiz.push(res[value.user.id]);
				}
				// Para estudiantes, solo sumar puntos de preguntas CERRADAS (available === false)
				if (isStaff || value.question?.available === false) {
					let pts = 0;
					if (typeof value.points === 'number') {
						pts = value.points;
					} else {
						pts = parseFloat(value.points) || 0;
					}
					res[value.user.id].points += pts;
				}

				return res;
			}, {});
		}

		if (quiz.quizType === 'group') {
			quiz.answers.reduce((res, value) => {
				if (!res[value.group.id]) {
					res[value.group.id] = { group: value.group, points: 0 };
					resultQuiz.push(res[value.group.id]);
				}
				// Para estudiantes, solo sumar puntos de preguntas CERRADAS (available === false)
				if (isStaff || value.question?.available === false) {
					let pts = 0;
					if (typeof value.points === 'number') {
						pts = value.points;
					} else {
						pts = parseFloat(value.points) || 0;
					}
					res[value.group.id].points += pts;
				}

				return res;
			}, {});
		}
		return resultQuiz.sort((a, b) => b.points - a.points);
	}

	async importQuestionsToQuiz(
		id: number,
		importFromQuizDto: ImportFromQuizDto,
	): Promise<Question[]> {
		const fromQuiz: Quiz = await this.quizRepository
			.findOneOrFail({
				relations: ['questions', 'questions.options'],
				where: { id: importFromQuizDto.fromQuizId },
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
				`You can only import questions to a quiz that doesn't have them`,
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
		id: number,
		dto: ImportQuestionsMixDto,
	): Promise<Question[]> {
		return this.dataSource.transaction(async (manager) => {
			const toQuiz = await manager.findOneOrFail(Quiz, {
				where: { id },
				relations: ['questions', 'institute'],
			});

			const questionsToImport = await manager.find(Question, {
				where: {
					id: In(dto.questions.map((q) => q.id)),
				},
				relations: ['options'],
			});

			const existingTitles = new Set(
				toQuiz.questions.map((q) => q.title.toLowerCase().trim()),
			);

			for (const questionData of dto.questions) {
				const normalizedTitle = questionData.title.toLowerCase().trim();
				if (existingTitles.has(normalizedTitle)) {
					// Maybe log this skip action
					continue;
				}

				const sourceQuestion = questionsToImport.find(
					(q) => q.id === questionData.id,
				);
				if (!sourceQuestion) {
					// Maybe log this skip action
					continue;
				}

				const newQuestion = manager.create(Question, {
					title: questionData.title,
					sentence: sourceQuestion.sentence,
					points: sourceQuestion.points,
					photo: sourceQuestion.photo,
					quiz: toQuiz,
					institute: toQuiz.institute,
					visible: false,
					available: false,
					exist: true,
				});

				const savedQuestion = await manager.save(newQuestion);

				if (sourceQuestion.options?.length > 0) {
					const newOptions = sourceQuestion.options.map((option) =>
						manager.create(Option, {
							identifier: option.identifier,
							sentence: option.sentence,
							correct: option.correct,
							exist: true,
							question: savedQuestion,
							institute: toQuiz.institute,
						}),
					);
					await manager.save(newOptions);
				}
				existingTitles.add(normalizedTitle);
			}

			const updatedQuiz = await manager.findOneOrFail(Quiz, {
				where: { id },
				relations: ['questions', 'questions.options'],
			});

			return updatedQuiz.questions;
		});
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
		await this.courseAccessService.assertQuizAccess(id, user);

		const isStaff =
			user.rol === Role.Admin ||
			user.rol === Role.Teacher ||
			user.rol === Role.Director ||
			user.rol === Role.Coordinator;

		const questionsToCount = isStaff
			? quiz.questions
			: quiz.questions.filter((q) => q.available === false);

		const points = questionsToCount.reduce((res, value) => res + value.points, 0);

		return { points };
	}

	async getPendingGrading(query: QueryQuizDto): Promise<Quiz[]> {
		const { courseId, periodId, year, instituteId, category } = query;

		const quizzes: Quiz[] = await this.quizRepository.find({
			relations: ['lesson'],
			where: {
				lesson: {
					course: { id: courseId },
					period: { id: periodId },
					year: year,
				},
				category: category,
				institute: { id: instituteId },
			},
		});

		const quizzesWithPendingGrading: Quiz[] = [];
		for (const quiz of quizzes) {
			const answersCount = await this.answerRepository.count({
				where: { quiz: { id: quiz.id } },
			});

			const gradesCount = await this.gradeRepository.count({
				where: {
					gradableId: quiz.id,
					gradableType: 'quiz',
				},
			});

			if (answersCount > 0 && gradesCount === 0) {
				quizzesWithPendingGrading.push(quiz);
			}
		}

		return quizzesWithPendingGrading;
	}

	async saveScan(
		quizId: number,
		data: {
			userId: number;
			section?: number;
			image?: string;
			studentCode?: string;
			instituteId?: number;
		},
	): Promise<QuizScan> {
		if (!data.userId) {
			throw new BadRequestException(
				'userId es requerido para guardar el escaneo de la hoja',
			);
		}

		const quiz = await this.quizRepository.findOne({
			where: { id: quizId },
			relations: ['institute'],
		});
		if (!quiz) {
			throw new NotFoundException(`Cuestionario ${quizId} no encontrado`);
		}

		const section = data.section ? Number(data.section) : 1;

		let scan = await this.quizScanRepository.findOne({
			where: {
				quizId,
				userId: data.userId,
				section,
			},
		});

		// Si ya existía un escaneo previo para este estudiante y sección, eliminar el archivo anterior del disco
		if (scan?.filename) {
			this.filesService.deleteTestScan(String(quizId), scan.filename);
		}
		if (data.studentCode) {
			this.filesService.deleteStudentScans(
				String(quizId),
				String(data.studentCode),
				section,
			);
		}
		if (data.userId) {
			this.filesService.deleteStudentScans(
				String(quizId),
				String(data.userId),
				section,
			);
		}

		const fileResult = await this.filesService.saveTestScan(
			String(quizId),
			undefined,
			{
				image: data.image,
				studentCode: data.studentCode,
				studentId: data.userId,
				section,
			},
		);

		if (!scan) {
			scan = this.quizScanRepository.create({
				quizId,
				userId: data.userId,
				section,
				imageUrl: fileResult.url,
				filename: fileResult.filename,
				instituteId: data.instituteId || quiz.institute?.id || null,
			});
		} else {
			scan.imageUrl = fileResult.url;
			scan.filename = fileResult.filename;
			if (data.instituteId) {
				scan.instituteId = data.instituteId;
			}
		}

		return this.quizScanRepository.save(scan);
	}

	async getScans(quizId: number, userId?: number): Promise<QuizScan[]> {
		try {
			const whereClause: any = { quizId };
			if (userId) {
				whereClause.userId = userId;
			}

			return await this.quizScanRepository.find({
				where: whereClause,
				relations: ['user'],
				order: {
					section: 'ASC',
					createdAt: 'DESC',
				},
			});
		} catch (error) {
			if (error?.message?.includes('no such table')) {
				return [];
			}
			throw error;
		}
	}
}
