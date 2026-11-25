import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GradesService } from './grades.service';
import { EvaluationStatus, Grade, SubmissionStatus } from './grade.entity';
import { User } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Activity } from '../activities/activity.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { ActivityEvidence } from '../activity-evidences/activity-evidence.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';
import { Answer } from '../answers/answer.entity';
import { UserToCourse } from '../users/userToCourse.entity';

describe('GradesService', () => {
	let service: GradesService;

	const mockGradeRepo = {
		findOne: jest.fn(),
		find: jest.fn(),
		save: jest.fn(),
		createQueryBuilder: jest.fn(),
	};
	const mockUserRepo = { findOneByOrFail: jest.fn() };
	const mockQuizRepo = { findOne: jest.fn(), find: jest.fn() };
	const mockActivityRepo = { findOne: jest.fn(), find: jest.fn() };
	const mockPeriodRepo = { findOneByOrFail: jest.fn() };
	const mockInstituteRepo = { findOneByOrFail: jest.fn() };
	const mockEvidenceRepo = { find: jest.fn() };
	const mockCriterionScoreRepo = { createQueryBuilder: jest.fn() };
	const mockAnswerRepo = { createQueryBuilder: jest.fn() };
	const mockUserToCourseRepo = { find: jest.fn() };

	beforeEach(async () => {
		jest.clearAllMocks();
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GradesService,
				{ provide: getRepositoryToken(Grade), useValue: mockGradeRepo },
				{ provide: getRepositoryToken(User), useValue: mockUserRepo },
				{ provide: getRepositoryToken(Quiz), useValue: mockQuizRepo },
				{ provide: getRepositoryToken(Activity), useValue: mockActivityRepo },
				{ provide: getRepositoryToken(Period), useValue: mockPeriodRepo },
				{ provide: getRepositoryToken(Institute), useValue: mockInstituteRepo },
				{
					provide: getRepositoryToken(ActivityEvidence),
					useValue: mockEvidenceRepo,
				},
				{
					provide: getRepositoryToken(StudentCriterionScore),
					useValue: mockCriterionScoreRepo,
				},
				{ provide: getRepositoryToken(Answer), useValue: mockAnswerRepo },
				{
					provide: getRepositoryToken(UserToCourse),
					useValue: mockUserToCourseRepo,
				},
			],
		}).compile();

		service = module.get<GradesService>(GradesService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('Submission, Evaluation and Audit derivation', () => {
		it('classifies unsubmitted and unevaluated work as NOT_SUBMITTED + NO_SUBMISSION without forcing 0', () => {
			const sub = service.deriveSubmissionStatus(null, false, false, false);
			const evalSt = service.deriveEvaluationStatus(null, null, false);
			const audit = service.classifyAudit(sub, null);

			expect(sub).toBe(SubmissionStatus.NOT_SUBMITTED);
			expect(evalSt).toBe(EvaluationStatus.NOT_EVALUATED);
			expect(audit).toBe('NO_SUBMISSION');
		});

		it('classifies submitted work without grade as SUBMITTED + PENDING_GRADING', () => {
			const sub = service.deriveSubmissionStatus(null, true, false, false);
			const evalSt = service.deriveEvaluationStatus(null, null, false);
			const audit = service.classifyAudit(sub, null);

			expect(sub).toBe(SubmissionStatus.SUBMITTED);
			expect(evalSt).toBe(EvaluationStatus.NOT_EVALUATED);
			expect(audit).toBe('PENDING_GRADING');
		});

		it('classifies real zero grade on submitted work as SUBMITTED + GRADED + GRADED_ZERO', () => {
			const sub = service.deriveSubmissionStatus(
				SubmissionStatus.SUBMITTED,
				true,
				true,
				true,
			);
			const evalSt = service.deriveEvaluationStatus(null, 0, true);
			const audit = service.classifyAudit(sub, 0);

			expect(sub).toBe(SubmissionStatus.SUBMITTED);
			expect(evalSt).toBe(EvaluationStatus.GRADED);
			expect(audit).toBe('GRADED_ZERO');
		});

		it('preserves legacy graded zero without evidence as UNKNOWN submissionStatus and GRADED_ZERO without losing graded state', () => {
			const sub = service.deriveSubmissionStatus(null, false, false, true);
			const evalSt = service.deriveEvaluationStatus(null, 0, false);
			const audit = service.classifyAudit(sub, 0);

			expect(sub).toBe(SubmissionStatus.UNKNOWN);
			expect(evalSt).toBe(EvaluationStatus.GRADED);
			expect(audit).toBe('GRADED_ZERO');
		});

		it('classifies UNKNOWN without grade as NEEDS_REVIEW', () => {
			const sub = service.deriveSubmissionStatus(null, false, true, false);
			const evalSt = service.deriveEvaluationStatus(null, null, true);
			const audit = service.classifyAudit(sub, null);

			expect(sub).toBe(SubmissionStatus.UNKNOWN);
			expect(evalSt).toBe(EvaluationStatus.PARTIAL);
			expect(audit).toBe('NEEDS_REVIEW');
		});
	});

	describe('create()', () => {
		beforeEach(() => {
			mockActivityRepo.findOne.mockResolvedValue({
				id: 10,
				classifications: ['execution'],
			});
			mockGradeRepo.findOne.mockResolvedValue(null);
			mockUserRepo.findOneByOrFail.mockResolvedValue({ id: 1 });
			mockPeriodRepo.findOneByOrFail.mockResolvedValue({ id: 2 });
			mockInstituteRepo.findOneByOrFail.mockResolvedValue({ id: 3 });
			mockGradeRepo.save.mockImplementation(async (g) => g);
		});

		it('keeps grade as null when omitted or null instead of coercing to 0', async () => {
			const saved = (await service.create({
				userId: 1,
				gradableId: 10,
				gradableType: 'activity',
				periodId: 2,
				instituteId: 3,
				grade: null,
				submissionStatus: SubmissionStatus.NOT_SUBMITTED,
			})) as Grade;

			expect(saved.grade).toBeNull();
			expect(saved.submissionStatus).toBe(SubmissionStatus.NOT_SUBMITTED);
			expect(saved.evaluationStatus).toBe(EvaluationStatus.NOT_EVALUATED);
		});

		it('persists real zero when grade is explicitly 0', async () => {
			const saved = (await service.create({
				userId: 1,
				gradableId: 10,
				gradableType: 'activity',
				periodId: 2,
				instituteId: 3,
				grade: 0,
				submissionStatus: SubmissionStatus.SUBMITTED,
			})) as Grade;

			expect(saved.grade).toBe(0);
			expect(saved.submissionStatus).toBe(SubmissionStatus.SUBMITTED);
			expect(saved.evaluationStatus).toBe(EvaluationStatus.GRADED);
		});
	});

	describe('getCourseAudit()', () => {
		it('distinguishes NO_SUBMISSION, PENDING_GRADING, GRADED_ZERO, and legacy graded zero', async () => {
			mockUserToCourseRepo.find.mockResolvedValue([
				{ user: { id: 1 } },
				{ user: { id: 2 } },
				{ user: { id: 3 } },
				{ user: { id: 4 } },
			]);
			mockActivityRepo.find.mockResolvedValue([{ id: 100 }]);
			mockQuizRepo.find.mockResolvedValue([]);

			mockGradeRepo.find.mockResolvedValue([
				// Student 3: real zero with SUBMITTED
				{
					user: { id: 3 },
					gradableId: 100,
					gradableType: 'activity',
					grade: 0,
					submissionStatus: SubmissionStatus.SUBMITTED,
					evaluationStatus: EvaluationStatus.GRADED,
				},
				// Student 4: legacy zero without persisted submissionStatus and without evidence
				{
					user: { id: 4 },
					gradableId: 100,
					gradableType: 'activity',
					grade: 0,
					submissionStatus: null,
					evaluationStatus: null,
				},
			]);

			// Student 2 & 3 have evidence; Student 1 & 4 do not
			mockEvidenceRepo.find.mockResolvedValue([
				{ studentId: 2, activityId: 100 },
				{ studentId: 3, activityId: 100 },
			]);
			mockCriterionScoreRepo.createQueryBuilder.mockReturnValue({
				select: jest.fn().mockReturnThis(),
				addSelect: jest.fn().mockReturnThis(),
				where: jest.fn().mockReturnThis(),
				andWhere: jest.fn().mockReturnThis(),
				groupBy: jest.fn().mockReturnThis(),
				addGroupBy: jest.fn().mockReturnThis(),
				getRawMany: jest.fn().mockResolvedValue([]),
			});

			const audit = await service.getCourseAudit(5, 2, 2026);
			const byStudent = new Map(audit.map((a) => [a.studentId, a]));

			// Student 1: no evidence, no grade -> NOT_SUBMITTED + null -> NO_SUBMISSION
			expect(byStudent.get(1)).toMatchObject({
				grade: null,
				submissionStatus: SubmissionStatus.NOT_SUBMITTED,
				auditClassification: 'NO_SUBMISSION',
			});
			// Student 2: submitted, no grade -> SUBMITTED + null -> PENDING_GRADING
			expect(byStudent.get(2)).toMatchObject({
				grade: null,
				submissionStatus: SubmissionStatus.SUBMITTED,
				auditClassification: 'PENDING_GRADING',
			});
			// Student 3: submitted, real 0 -> SUBMITTED + 0 -> GRADED_ZERO
			expect(byStudent.get(3)).toMatchObject({
				grade: 0,
				submissionStatus: SubmissionStatus.SUBMITTED,
				evaluationStatus: EvaluationStatus.GRADED,
				auditClassification: 'GRADED_ZERO',
			});
			// Student 4: legacy 0 without evidence -> preserves graded 0 without data loss
			expect(byStudent.get(4)).toMatchObject({
				grade: 0,
				submissionStatus: SubmissionStatus.UNKNOWN,
				evaluationStatus: EvaluationStatus.GRADED,
				auditClassification: 'GRADED_ZERO',
			});
		});
	});
});
