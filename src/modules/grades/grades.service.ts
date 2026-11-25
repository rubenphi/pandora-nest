import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Brackets } from 'typeorm';
import {
	AuditClassification,
	EvaluationStatus,
	Grade,
	SubmissionStatus,
} from './grade.entity';
import { User } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { QueryGradeDto } from './dto/query-grade.dto';
import { Activity } from '../activities/activity.entity';
import { ActivityEvidence } from '../activity-evidences/activity-evidence.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';
import { Answer } from '../answers/answer.entity';
import { UserToCourse } from '../users/userToCourse.entity';

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
		@InjectRepository(ActivityEvidence)
		private readonly evidenceRepository: Repository<ActivityEvidence>,
		@InjectRepository(StudentCriterionScore)
		private readonly criterionScoreRepository: Repository<StudentCriterionScore>,
		@InjectRepository(Answer)
		private readonly answerRepository: Repository<Answer>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
	) {}

	deriveSubmissionStatus(
		persistedStatus: SubmissionStatus | null | undefined,
		hasEvidenceOrAnswer: boolean,
		hasCriterionScores: boolean,
		hasGrade: boolean,
	): SubmissionStatus {
		if (persistedStatus) {
			return persistedStatus;
		}
		if (hasEvidenceOrAnswer) {
			return SubmissionStatus.SUBMITTED;
		}
		if (!hasCriterionScores && !hasGrade) {
			return SubmissionStatus.NOT_SUBMITTED;
		}
		return SubmissionStatus.UNKNOWN;
	}

	deriveEvaluationStatus(
		persistedStatus: EvaluationStatus | null | undefined,
		grade: number | null | undefined,
		hasCriterionScores: boolean,
	): EvaluationStatus {
		if (grade !== null && grade !== undefined) {
			return EvaluationStatus.GRADED;
		}
		if (persistedStatus && persistedStatus !== EvaluationStatus.GRADED) {
			return persistedStatus;
		}
		if (hasCriterionScores) {
			return EvaluationStatus.PARTIAL;
		}
		return EvaluationStatus.NOT_EVALUATED;
	}

	classifyAudit(
		submissionStatus: SubmissionStatus,
		grade: number | null | undefined,
	): AuditClassification {
		if (grade === 0) {
			return 'GRADED_ZERO';
		}
		if (grade !== null && grade !== undefined) {
			return 'GRADED';
		}
		if (submissionStatus === SubmissionStatus.NOT_SUBMITTED) {
			return 'NO_SUBMISSION';
		}
		if (submissionStatus === SubmissionStatus.SUBMITTED) {
			return 'PENDING_GRADING';
		}
		return 'NEEDS_REVIEW';
	}

	async create(createGradeDto: CreateGradeDto): Promise<Grade | Grade[]> {
		const {
			userId,
			gradableId,
			gradableType,
			periodId,
			instituteId,
			registrarMayor,
			submissionStatus,
			evaluationStatus,
		} = createGradeDto;
		const incomingGrade =
			createGradeDto.grade !== undefined ? createGradeDto.grade : null;

		const gradableItem = await this.findGradableItem(gradableId, gradableType);
		let classificationsToProcess: string[];

		if (createGradeDto.classification) {
			classificationsToProcess = [createGradeDto.classification];
		} else {
			const itemAsAny = gradableItem as any;
			classificationsToProcess = itemAsAny.classifications?.length
				? itemAsAny.classifications
				: [gradableType === 'quiz' ? itemAsAny.classification : 'execution'];
		}

		const savedGrades: Grade[] = [];

		for (const cls of classificationsToProcess) {
			const gradeExist = await this.gradeRepository.findOne({
				where: {
					user: { id: userId },
					gradableId,
					gradableType,
					classification: cls as any,
				},
			});

			if (gradeExist) {
				if (
					registrarMayor &&
					incomingGrade !== null &&
					gradeExist.grade !== null &&
					incomingGrade <= gradeExist.grade
				) {
					savedGrades.push(gradeExist);
					continue;
				}
				gradeExist.grade = incomingGrade;
				gradeExist.classification = cls as any;
				if (submissionStatus !== undefined) {
					gradeExist.submissionStatus = submissionStatus;
				}
				gradeExist.evaluationStatus =
					evaluationStatus ??
					(incomingGrade !== null
						? EvaluationStatus.GRADED
						: EvaluationStatus.NOT_EVALUATED);
				savedGrades.push(await this.gradeRepository.save(gradeExist));
				continue;
			}

			const newGrade = new Grade();
			newGrade.grade = incomingGrade;
			newGrade.gradableId = gradableId;
			newGrade.gradableType = gradableType;
			newGrade.classification = cls as any;
			newGrade.submissionStatus = submissionStatus ?? null;
			newGrade.evaluationStatus =
				evaluationStatus ??
				(incomingGrade !== null
					? EvaluationStatus.GRADED
					: EvaluationStatus.NOT_EVALUATED);

			newGrade.user = await this.userRepository.findOneByOrFail({ id: userId });
			newGrade.period = await this.periodRepository.findOneByOrFail({
				id: periodId,
			});
			newGrade.institute = await this.instituteRepository.findOneByOrFail({
				id: instituteId,
			});

			savedGrades.push(await this.gradeRepository.save(newGrade));
		}

		return savedGrades.length === 1 ? savedGrades[0] : savedGrades;
	}

	async findAll(queryGrades: QueryGradeDto): Promise<Grade[]> {
		const {
			userId,
			gradableId,
			gradableType,
			gradeType,
			classification,
			periodId,
			gradeMin,
			gradeMax,
			instituteId,
			courseId,
			areaId,
			year,
		} = queryGrades;

		const where: any = {};
		if (userId) where.user = { id: userId };
		if (periodId) where.period = { id: periodId };
		if (instituteId) where.institute = { id: instituteId };
		if (gradeType) where.gradeType = gradeType;
		if (classification) where.classification = classification;

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
			if (!gradableType || gradableType === 'quiz') {
				const quizWhere: any = { lesson: {} };
				if (courseId) quizWhere.lesson.course = { id: courseId };
				if (areaId) quizWhere.lesson.area = { id: areaId };
				if (year) quizWhere.lesson.year = year;
				if (periodId) quizWhere.lesson.period = { id: periodId };

				const quizzes = await this.quizRepository.find({
					where: quizWhere,
					relations: [
						'lesson',
						'lesson.course',
						'lesson.area',
						'lesson.period',
					],
				});
				quizIds.push(...quizzes.map((q) => q.id));
			}

			// Filter Activities
			if (!gradableType || gradableType === 'activity') {
				const activityWhere: any = { lesson: {} };
				if (courseId) activityWhere.lesson.course = { id: courseId };
				if (areaId) activityWhere.lesson.area = { id: areaId };
				if (year) activityWhere.lesson.year = year;
				if (periodId) activityWhere.lesson.period = { id: periodId };

				const activities = await this.activityRepository.find({
					where: activityWhere,
					relations: [
						'lesson',
						'lesson.course',
						'lesson.area',
						'lesson.period',
					],
				});
				activityIds.push(...activities.map((a) => a.id));
			}

			if (gradableType === 'quiz') {
				if (quizIds.length > 0) {
					where.gradableId = In(quizIds);
					where.gradableType = 'quiz';
				} else {
					return [];
				}
			} else if (gradableType === 'activity') {
				if (activityIds.length > 0) {
					where.gradableId = In(activityIds);
					where.gradableType = 'activity';
				} else {
					return [];
				}
			} else {
				const allIds = [...quizIds, ...activityIds];
				if (allIds.length > 0) {
					where.gradableId = In(allIds);
					where.gradableType = In(['quiz', 'activity']);
				} else {
					return [];
				}
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

		await this.enrichGradesWithAudit(grades);

		return grades;
	}

	private async enrichGradesWithAudit(grades: Grade[]): Promise<void> {
		if (!grades || grades.length === 0) return;

		const activityIds = Array.from(
			new Set(
				grades
					.filter((g) => g.gradableType === 'activity')
					.map((g) => g.gradableId),
			),
		);
		const quizIds = Array.from(
			new Set(
				grades
					.filter((g) => g.gradableType === 'quiz')
					.map((g) => g.gradableId),
			),
		);

		const evidenceSet = new Set<string>();
		const scoreSet = new Set<string>();
		const answerSet = new Set<string>();

		if (activityIds.length > 0) {
			const evidences = await this.evidenceRepository.find({
				where: { activityId: In(activityIds) },
				select: ['studentId', 'activityId'],
			});
			evidences.forEach((ev) =>
				evidenceSet.add(`${ev.studentId}:${ev.activityId}`),
			);

			const scores = await this.criterionScoreRepository
				.createQueryBuilder('scs')
				.select('scs.studentId', 'studentId')
				.addSelect('scs.activityId', 'activityId')
				.where('scs.activityId IN (:...activityIds)', { activityIds })
				.groupBy('scs.studentId')
				.addGroupBy('scs.activityId')
				.getRawMany();
			scores.forEach((s) => scoreSet.add(`${s.studentId}:${s.activityId}`));
		}

		if (quizIds.length > 0) {
			const answers = await this.answerRepository
				.createQueryBuilder('ans')
				.select('ans.userId', 'userId')
				.addSelect('ans.quizId', 'quizId')
				.where('ans.quizId IN (:...quizIds)', { quizIds })
				.andWhere('ans.exist = :exist', { exist: true })
				.groupBy('ans.userId')
				.addGroupBy('ans.quizId')
				.getRawMany();
			answers.forEach((a) => answerSet.add(`${a.userId}:${a.quizId}`));
		}

		for (const g of grades) {
			const userId = g.user?.id;
			const key = `${userId}:${g.gradableId}`;
			const hasEvidenceOrAnswer =
				g.gradableType === 'activity'
					? evidenceSet.has(key)
					: answerSet.has(key);
			const hasScores = g.gradableType === 'activity' && scoreSet.has(key);
			const hasGrade = g.grade !== null && g.grade !== undefined;

			const derivedSub = this.deriveSubmissionStatus(
				g.submissionStatus,
				hasEvidenceOrAnswer,
				hasScores,
				hasGrade,
			);
			const derivedEval = this.deriveEvaluationStatus(
				g.evaluationStatus,
				g.grade,
				hasScores,
			);

			g.derivedSubmissionStatus = derivedSub;
			g.derivedEvaluationStatus = derivedEval;
			g.auditClassification = this.classifyAudit(derivedSub, g.grade);
			if (!g.submissionStatus) {
				g.submissionStatus = derivedSub;
			}
			if (!g.evaluationStatus) {
				g.evaluationStatus = derivedEval;
			}
		}
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
		await this.gradeRepository.findOneByOrFail({ id });

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
			.andWhere('grade.grade IS NOT NULL')
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

	async getCourseAudit(
		courseId: number,
		periodId: number,
		year: number,
		areaId?: number,
	): Promise<
		{
			studentId: number;
			gradableId: number;
			gradableType: 'activity' | 'quiz';
			grade: number | null;
			submissionStatus: SubmissionStatus;
			evaluationStatus: EvaluationStatus;
			auditClassification: AuditClassification;
		}[]
	> {
		if (!courseId || !periodId || !year) {
			return [];
		}

		const enrollments = await this.userToCourseRepository.find({
			where: {
				course: { id: courseId },
				year,
				active: true,
				rol: 'student',
			},
			relations: ['user'],
		});
		const studentIds = enrollments
			.map((e) => e.user?.id)
			.filter((id): id is number => Boolean(id));

		const lessonWhere: any = {
			course: { id: courseId },
			period: { id: periodId },
			year,
		};
		if (areaId) {
			lessonWhere.area = { id: areaId };
		}

		const [activities, quizzes] = await Promise.all([
			this.activityRepository.find({
				where: { lesson: lessonWhere },
				select: { id: true },
			}),
			this.quizRepository.find({
				where: { lesson: lessonWhere },
				select: { id: true },
			}),
		]);

		const activityIds = activities.map((a) => a.id);
		const quizIds = quizzes.map((q) => q.id);
		if (
			studentIds.length === 0 ||
			(activityIds.length === 0 && quizIds.length === 0)
		) {
			return [];
		}

		const gradeRecords = await this.gradeRepository.find({
			where: {
				user: { id: In(studentIds) },
				period: { id: periodId },
			},
			relations: ['user'],
		});

		const gradeMap = new Map<string, Grade>();
		gradeRecords.forEach((g) => {
			if (g.user?.id) {
				gradeMap.set(`${g.user.id}:${g.gradableType}:${g.gradableId}`, g);
			}
		});

		const evidenceSet = new Set<string>();
		const scoreSet = new Set<string>();
		const answerSet = new Set<string>();

		if (activityIds.length > 0) {
			const evidences = await this.evidenceRepository.find({
				where: {
					activityId: In(activityIds),
					studentId: In(studentIds),
				},
				select: ['studentId', 'activityId'],
			});
			evidences.forEach((ev) =>
				evidenceSet.add(`${ev.studentId}:${ev.activityId}`),
			);

			const scores = await this.criterionScoreRepository
				.createQueryBuilder('scs')
				.select('scs.studentId', 'studentId')
				.addSelect('scs.activityId', 'activityId')
				.where('scs.activityId IN (:...activityIds)', { activityIds })
				.andWhere('scs.studentId IN (:...studentIds)', { studentIds })
				.groupBy('scs.studentId')
				.addGroupBy('scs.activityId')
				.getRawMany();
			scores.forEach((s) => scoreSet.add(`${s.studentId}:${s.activityId}`));
		}

		if (quizIds.length > 0) {
			const answers = await this.answerRepository
				.createQueryBuilder('ans')
				.select('ans.userId', 'userId')
				.addSelect('ans.quizId', 'quizId')
				.where('ans.quizId IN (:...quizIds)', { quizIds })
				.andWhere('ans.userId IN (:...studentIds)', { studentIds })
				.andWhere('ans.exist = :exist', { exist: true })
				.groupBy('ans.userId')
				.addGroupBy('ans.quizId')
				.getRawMany();
			answers.forEach((a) => answerSet.add(`${a.userId}:${a.quizId}`));
		}

		const results: {
			studentId: number;
			gradableId: number;
			gradableType: 'activity' | 'quiz';
			grade: number | null;
			submissionStatus: SubmissionStatus;
			evaluationStatus: EvaluationStatus;
			auditClassification: AuditClassification;
		}[] = [];

		for (const studentId of studentIds) {
			for (const actId of activityIds) {
				const existing = gradeMap.get(`${studentId}:activity:${actId}`);
				const key = `${studentId}:${actId}`;
				const hasEvidence = evidenceSet.has(key);
				const hasScores = scoreSet.has(key);
				const gradeVal = existing ? existing.grade : null;
				const hasGrade = gradeVal !== null && gradeVal !== undefined;

				const submissionStatus = this.deriveSubmissionStatus(
					existing?.submissionStatus,
					hasEvidence,
					hasScores,
					hasGrade,
				);
				const evaluationStatus = this.deriveEvaluationStatus(
					existing?.evaluationStatus,
					gradeVal,
					hasScores,
				);
				results.push({
					studentId,
					gradableId: actId,
					gradableType: 'activity',
					grade: gradeVal,
					submissionStatus,
					evaluationStatus,
					auditClassification: this.classifyAudit(submissionStatus, gradeVal),
				});
			}

			for (const quizId of quizIds) {
				const existing = gradeMap.get(`${studentId}:quiz:${quizId}`);
				const key = `${studentId}:${quizId}`;
				const hasAnswer = answerSet.has(key);
				const gradeVal = existing ? existing.grade : null;
				const hasGrade = gradeVal !== null && gradeVal !== undefined;

				const submissionStatus = this.deriveSubmissionStatus(
					existing?.submissionStatus,
					hasAnswer,
					false,
					hasGrade,
				);
				const evaluationStatus = this.deriveEvaluationStatus(
					existing?.evaluationStatus,
					gradeVal,
					false,
				);
				results.push({
					studentId,
					gradableId: quizId,
					gradableType: 'quiz',
					grade: gradeVal,
					submissionStatus,
					evaluationStatus,
					auditClassification: this.classifyAudit(submissionStatus, gradeVal),
				});
			}
		}

		return results;
	}
}
