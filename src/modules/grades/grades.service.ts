import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Brackets } from 'typeorm';
import { Grade } from './grade.entity';
import { User } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { QueryGradeDto } from './dto/query-grade.dto';
import { Activity } from '../activities/activity.entity';

@Injectable()
export class GradesService {
	constructor(
		@InjectRepository(Grade)
		private readonly gradeRepository: Repository<Grade>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async create(createGradeDto: CreateGradeDto): Promise<Grade> {
		const {
			userId,
			gradableId,
			gradableType,
			periodId,
			grade,
			instituteId,
			registrarMayor,
		} = createGradeDto;

		await this.findGradableItem(gradableId, gradableType);

		const gradeExist = await this.gradeRepository.findOne({
			where: {
				user: { id: userId },
				gradableId,
				gradableType,
			},
		});

		if (gradeExist) {
			if (registrarMayor && grade <= gradeExist.grade) {
				return gradeExist;
			}
			gradeExist.grade = grade;
			return this.gradeRepository.save(gradeExist);
		}

		const newGrade = new Grade();
		newGrade.grade = grade;
		newGrade.gradableId = gradableId;
		newGrade.gradableType = gradableType;
		newGrade.user = await this.userRepository.findOneByOrFail({ id: userId });
		newGrade.period = await this.periodRepository.findOneByOrFail({
			id: periodId,
		});
		newGrade.institute = await this.instituteRepository.findOneByOrFail({
			id: instituteId,
		});

		return this.gradeRepository.save(newGrade);
	}

	async findAll(queryGrades: QueryGradeDto): Promise<Grade[]> {
		const {
			userId,
			gradableId,
			gradableType,
			periodId,
			gradeMin,
			gradeMax,
			instituteId,
			courseId,
			areaId,
			year,
		} = queryGrades;

		const where: any = {
			user: { id: userId },
			period: { id: periodId },
			institute: { id: instituteId },
		};

		// Handle gradableId and gradableType filters
		if (gradableId) {
			where.gradableId = gradableId;
		}
		if (gradableType) {
			where.gradableType = gradableType;
		}

		// Handle lesson-related filters
		if (courseId || areaId || year) {
			const quizIds: number[] = [];
			const activityIds: number[] = [];

			// Filter Quizzes
			const quizWhere: any = { lesson: {} };
			if (courseId) quizWhere.lesson.course = { id: courseId };
			if (areaId) quizWhere.lesson.area = { id: areaId };
			if (year) quizWhere.lesson.year = year;

			const quizzes = await this.quizRepository.find({
				where: quizWhere,
				relations: ['lesson', 'lesson.course', 'lesson.area'],
			});
			quizIds.push(...quizzes.map((q) => q.id));

			// Filter Activities
			const activityWhere: any = { lesson: {} };
			if (courseId) activityWhere.lesson.course = { id: courseId };
			if (areaId) activityWhere.lesson.area = { id: areaId };
			if (year) activityWhere.lesson.year = year;

			const activities = await this.activityRepository.find({
				where: activityWhere,
				relations: ['lesson', 'lesson.course', 'lesson.area'],
			});
			activityIds.push(...activities.map((a) => a.id));

			// Combine filters for gradableId and gradableType
			const combinedGradableFilters: any[] = [];
			if (quizIds.length > 0) {
				combinedGradableFilters.push({
					gradableType: 'quiz',
					gradableId: In(quizIds),
				});
			}
			if (activityIds.length > 0) {
				combinedGradableFilters.push({
					gradableType: 'activity',
					gradableId: In(activityIds),
				});
			}

			if (combinedGradableFilters.length > 0) {
				where.gradableId = In([...quizIds, ...activityIds]);
				where.gradableType = In(['quiz', 'activity']);
			} else {
				// If no quizzes or activities match the lesson filters, return empty array
				return [];
			}
		}

		if (gradeMin && gradeMax) {
			where.grade = Between(gradeMin, gradeMax);
		}

		const grades = await this.gradeRepository.find({
			where,
			relations: ['user'],
		});

		for (const grade of grades) {
			grade.gradableItem = await this.findGradableItem(
				grade.gradableId,
				grade.gradableType,
				['lesson', 'lesson.course', 'lesson.area'],
			);
		}

		return grades;
	}

	async findOne(id: number): Promise<Grade> {
		const grade = await this.gradeRepository
			.findOneOrFail({ where: { id }, relations: ['user'] })
			.catch(() => {
				throw new NotFoundException('Grade not found');
			});

		grade.gradableItem = await this.findGradableItem(
			grade.gradableId,
			grade.gradableType,
			['lesson'],
		);

		return grade;
	}

	async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
		const grade = await this.gradeRepository.findOneByOrFail({ id });

		if (updateGradeDto.gradableId && updateGradeDto.gradableType) {
			await this.findGradableItem(
				updateGradeDto.gradableId,
				updateGradeDto.gradableType,
			);
		}

		const gradeToUpdate = await this.gradeRepository.preload({
			id,
			...updateGradeDto,
		});

		if (!gradeToUpdate) {
			throw new NotFoundException('Grade not found for update');
		}

		return this.gradeRepository.save(gradeToUpdate);
	}

	async remove(id: number): Promise<void> {
		await this.gradeRepository.delete(id);
	}

	private async findGradableItem(
		id: number,
		type: string,
		relations: string[] = [],
	) {
		let repository: Repository<Quiz | Activity>;
		if (type === 'quiz') {
			repository = this.quizRepository;
		} else if (type === 'activity') {
			repository = this.activityRepository;
		} else {
			throw new BadRequestException(`Invalid gradableType: ${type}`);
		}

		const item = await repository.findOne({ where: { id }, relations });
		if (!item) {
			throw new NotFoundException(`${type} with ID ${id} not found`);
		}
		return item;
	}

	async getStudentAverages(
		courseId: number,
		periodId: number,
		year: number,
	): Promise<{ studentId: number; average: number }[]> {
		const quizIds = (
			await this.quizRepository.find({
				where: { lesson: { course: { id: courseId }, year } },
				select: { id: true },
			})
		).map((q) => q.id);

		const activityIds = (
			await this.activityRepository.find({
				where: { lesson: { course: { id: courseId }, year } },
				select: { id: true },
			})
		).map((a) => a.id);

		if (quizIds.length === 0 && activityIds.length === 0) {
			return [];
		}

		const grades = await this.gradeRepository
			.createQueryBuilder('grade')
			.select('grade.userId', 'studentId')
			.addSelect('AVG(grade.grade)', 'average')
			.where('grade.periodId = :periodId', { periodId })
			.andWhere(
				new Brackets((qb) => {
					if (quizIds.length > 0) {
						qb.where(
							'(grade.gradableType = :quizType AND grade.gradableId IN (:...quizIds))',
							{ quizType: 'quiz', quizIds },
						);
					}
					if (activityIds.length > 0) {
						if (quizIds.length > 0) {
							qb.orWhere(
								'(grade.gradableType = :activityType AND grade.gradableId IN (:...activityIds))',
								{ activityType: 'activity', activityIds },
							);
						} else {
							qb.where(
								'(grade.gradableType = :activityType AND grade.gradableId IN (:...activityIds))',
								{ activityType: 'activity', activityIds },
							);
						}
					}
				}),
			)
			.groupBy('grade.userId')
			.getRawMany();

		return grades.map((g) => ({
			studentId: parseInt(g.studentId),
			average: parseFloat(g.average),
		}));
	}
}
