import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository, ILike, In } from 'typeorm';

import { CreateLessonDto, UpdateLessonDto, QueryLessonDto } from './dto';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';
import { Period } from '../periods/period.entity';
import { ActivitiesService } from '../activities/activities.service';
import { QuizzesService } from '../quizzes/quizzes.service';
import { MaterialsService } from '../materials/materials.service';
import { ContentType } from '../lesson-items/lesson-item.entity';
import { LessonItem } from '../lesson-items/lesson-item.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Question } from '../questions/question.entity';
import { Option } from '../options/option.entity';
import { Material } from '../materials/material.entity';
import { CourseAccessService } from 'src/common/authorization/course-access.service';
import { UserToCourse } from '../users/userToCourse.entity';

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
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		private readonly activitiesService: ActivitiesService,
		private readonly quizzesService: QuizzesService,
		private readonly materialsService: MaterialsService,
		private readonly courseAccessService: CourseAccessService,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
	) {}

	private async getAllowedCourseIds(user: User): Promise<number[] | null> {
		if (this.courseAccessService.isStaff(user)) return null;
		const userCourses: UserToCourse[] = await this.userToCourseRepository.find({
			where: { user: { id: user.id }, active: true },
			relations: ['course'],
		});
		return userCourses.map((userCourse) => userCourse.course?.id);
	}

	async getLessons(queryLesson: QueryLessonDto, user: User): Promise<Lesson[]> {
		const allowedCourseIds = await this.getAllowedCourseIds(user);
		if (allowedCourseIds !== null) {
			if (
				queryLesson?.courseId &&
				!allowedCourseIds.includes(queryLesson.courseId)
			) {
				return [];
			}
			queryLesson = {
				...queryLesson,
				courseId: queryLesson?.courseId ?? allowedCourseIds[0],
			};
		}
		if (queryLesson) {
			return await this.lessonRepository.find({
				where: {
					year: queryLesson.year,
					course: { id: queryLesson.courseId },
					area: { id: queryLesson.areaId },
					topic: queryLesson.topic
						? ILike(`%${queryLesson.topic}%`)
						: undefined,
					date: queryLesson.date,
					exist: queryLesson.exist,
					period: { id: queryLesson.periodId },
					institute: { id: queryLesson.instituteId },
					type: queryLesson.type as any, // Cast to any or LessonType if imported
				},
				relations: ['course', 'area', 'institute'],
			});
		} else {
			return await this.lessonRepository.find({
				...(allowedCourseIds !== null
					? { where: { course: { id: In(allowedCourseIds) } } }
					: {}),
				relations: ['course', 'area', 'institute'],
			});
		}
	}

	async getLesson(id: number, user: User): Promise<Lesson> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'area', 'author', 'period', 'institute', 'items'],
				order: { items: { order: 'ASC' } }, // Asegura que los items estén ordenados
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});

		if (user.institute.id !== lesson.institute.id) {
			throw new ForbiddenException('You are not allowed to see this lesson');
		}
		await this.courseAccessService.assertCourseAccess(lesson.course?.id, user);

		// Resolver el contenido de cada LessonItem
		const resolvedItems = await Promise.all(
			lesson.items.map(async (item: LessonItem) => {
				let content: any;
				switch (item.contentType) {
					case ContentType.QUIZ:
						content = await this.quizzesService.findOne(item.contentId);
						break;
					case ContentType.ACTIVITY:
						content = await this.activitiesService.findOne(item.contentId);
						break;
					case ContentType.MATERIAL:
						content = await this.materialsService.findOne(item.contentId);
						break;
					default:
						content = null; // O manejar un error si el tipo no es reconocido
				}
				return { ...item, content }; // Adjuntar el contenido resuelto al item
			}),
		);

		// Reemplazar los items originales con los items resueltos
		(lesson as any).items = resolvedItems;

		return lesson;
	}

	async createLesson(lessonDto: CreateLessonDto, user: User): Promise<Lesson> {
		if (user.institute.id !== lessonDto.instituteId) {
			throw new ForbiddenException(
				'You are not allowed to create a lesson for this institute',
			);
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
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id: lessonDto.periodId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		const lesson: Lesson = await this.lessonRepository.create({
			year: lessonDto.year,
			topic: lessonDto.topic,
			date: lessonDto.date,
			institute,
			course,
			area,
			period,
			author: user,
			exist: lessonDto.exist,
		});
		return this.lessonRepository.save(lesson);
	}
	async updateLesson(
		id: number,
		lessonDto: UpdateLessonDto,
		user: User,
	): Promise<Lesson> {
		if (user.institute.id !== lessonDto.instituteId) {
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
		const period: Period = await this.periodRepository
			.findOneOrFail({
				where: { id: lessonDto.periodId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});
		const area: Area = await this.areaRepository
			.findOneOrFail({
				where: { id: lessonDto.areaId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});
		const lesson: Lesson = await this.lessonRepository.preload({
			year: lessonDto.year,
			id: id,
			topic: lessonDto.topic,
			date: lessonDto.date,
			institute,
			course,
			area,
			period,
			exist: lessonDto.exist,
		});
		lesson.author = lesson.author ?? user;
		if (user.rol !== Role.Admin && user.id !== lesson.author.id) {
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
				relations: ['institute', 'author'],
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The lesson you want to delete does not exist',
				);
			});
		if (user.institute.id !== lesson.institute.id) {
			throw new ForbiddenException('You are not allowed to delete this lesson');
		}
		if (user.rol !== Role.Admin && user.id !== lesson.author.id) {
			throw new ForbiddenException('You are not allowed to update this lesson');
		}
		this.lessonRepository.remove(lesson);
	}

	async getQuizzesByLesson(id: number, user: User): Promise<Quiz[]> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'quizzes',
					'quizzes.institute',
					'institute',
					'course',
					'quizzes.lesson',
				],
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});

		if (user.institute.id !== lesson.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to see quizzes from this lesson',
			);
		}
		await this.courseAccessService.assertCourseAccess(lesson.course?.id, user);

		return lesson.quizzes;
	}

	async getFullLessons(queryLesson: QueryLessonDto): Promise<any[]> {
		const where: any = {};

		if (queryLesson) {
			if (queryLesson.year) where.year = queryLesson.year;
			if (queryLesson.courseId) where.course = { id: queryLesson.courseId };
			if (queryLesson.areaId) where.area = { id: queryLesson.areaId };
			if (queryLesson.periodId) where.period = { id: queryLesson.periodId };
			if (queryLesson.exist !== undefined) where.exist = queryLesson.exist;
			if (queryLesson.type) where.type = queryLesson.type;
			if (queryLesson.instituteId)
				where.institute = { id: queryLesson.instituteId };
			if (queryLesson.topic) where.topic = ILike(`%${queryLesson.topic}%`);
			if (queryLesson.date) where.date = queryLesson.date;
		}

		const lessons = await this.lessonRepository.find({
			where,
			relations: ['course', 'area', 'period', 'institute'],
		});

		const enrichedLessons = await Promise.all(
			lessons.map(async (lesson) => {
				const [materials, activities, quizWithQuestion] = await Promise.all([
					this.getMaterialsForLesson(lesson.id),
					this.getActivitiesForLesson(lesson.id),
					this.getFirstQuestionForLesson(lesson.id),
				]);

				return {
					id: lesson.id,
					topic: lesson.topic,
					year: lesson.year,
					date: lesson.date,
					type: lesson.type,
					exist: lesson.exist,
					createdAt: lesson.createdAt,
					updatedAt: lesson.updatedAt,
					course: lesson.course,
					area: lesson.area,
					period: lesson.period,
					institute: lesson.institute,
					materials,
					quizQuestion: quizWithQuestion,
					activities,
				};
			}),
		);

		return enrichedLessons;
	}

	private async getMaterialsForLesson(lessonId: number): Promise<Material[]> {
		return this.materialsService.findAll({ lessonId } as any);
	}

	private async getActivitiesForLesson(lessonId: number): Promise<any[]> {
		const activities = await this.activitiesService.findAll({
			lessonId,
		} as any);
		return Promise.all(
			activities.map(async (activity) => {
				const fullActivity = await this.activitiesService.findOne(activity.id);
				return {
					id: fullActivity.id,
					title: fullActivity.title,
					instructions: fullActivity.instructions,
					classifications: fullActivity.classifications,
					criteria: fullActivity.criteria.map((criterion) => ({
						id: criterion.id,
						description: criterion.description,
						score: criterion.score,
					})),
				};
			}),
		);
	}

	private async getFirstQuestionForLesson(
		lessonId: number,
	): Promise<any | null> {
		const quizzes = await this.lessonRepository.findOne({
			where: { id: lessonId },
			relations: ['quizzes', 'quizzes.questions'],
		});

		if (!quizzes?.quizzes?.length) return null;

		const sortedQuizzes = [...quizzes.quizzes].sort((a, b) => a.id - b.id);
		const firstQuiz = sortedQuizzes[0];

		if (!firstQuiz?.questions?.length) return null;

		const sortedQuestions = [...firstQuiz.questions].sort(
			(a, b) => a.id - b.id,
		);
		const firstQuestion = sortedQuestions[0];

		const questionWithOptions = await this.questionRepository.findOne({
			where: { id: firstQuestion.id },
			relations: ['options'],
		});

		if (!questionWithOptions) return null;

		return {
			id: questionWithOptions.id,
			title: questionWithOptions.title,
			sentence: questionWithOptions.sentence,
			points: questionWithOptions.points,
			photo: questionWithOptions.photo,
			visible: questionWithOptions.visible,
			available: questionWithOptions.available,
			exist: questionWithOptions.exist,
			options: questionWithOptions.options.map((option) => ({
				id: option.id,
				identifier: option.identifier,
				sentence: option.sentence,
				correct: option.correct,
				exist: option.exist,
			})),
		};
	}
}
