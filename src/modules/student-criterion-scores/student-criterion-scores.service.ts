import {
	Injectable,
	ConflictException,
	UnauthorizedException,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { StudentCriterionScore } from './student-criterion-score.entity';
import {
	CreateStudentCriterionScoreDto,
	QueryStudentCriterionScoreDto,
	UpdateStudentCriterionScoreDto,
} from './dto';
import { User } from 'src/modules/users/user.entity';
import { Activity } from 'src/modules/activities/activity.entity';
import { Criterion } from 'src/modules/criteria/criterion.entity';
import { Institute } from 'src/modules/institutes/institute.entity';
import { Role } from 'src/modules/auth/roles.decorator';

@Injectable()
export class StudentCriterionScoresService {
	constructor(
		@InjectRepository(StudentCriterionScore)
		private readonly studentCriterionScoreRepository: Repository<StudentCriterionScore>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
		@InjectRepository(Criterion)
		private readonly criterionRepository: Repository<Criterion>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async create(
		createStudentCriterionScoreDto: CreateStudentCriterionScoreDto,
		user: User,
	): Promise<StudentCriterionScore> {
		const { studentId, criterionId } = createStudentCriterionScoreDto;

		const existingScore = await this.studentCriterionScoreRepository.findOne({
			where: { student: { id: studentId }, criterion: { id: criterionId } },
		});

		if (existingScore) {
			throw new ConflictException(
				'A score for this student and criterion already exists.',
			);
		}

		const studentCriterionScore = this.studentCriterionScoreRepository.create({
			score: createStudentCriterionScoreDto.score,
			student: await this.userRepository.findOneOrFail({
				where: { id: studentId },
			}),
			activity: await this.activityRepository.findOneOrFail({
				where: { id: createStudentCriterionScoreDto.activityId },
			}),
			criterion: await this.criterionRepository.findOneOrFail({
				where: { id: criterionId },
			}),
			institute: await this.instituteRepository.findOneOrFail({
				where: { id: createStudentCriterionScoreDto.instituteId },
			}),
			gradedBy: user,
			gradedAt: new Date(),
		});

		return this.studentCriterionScoreRepository.save(studentCriterionScore);
	}

	async findAll(
		query: QueryStudentCriterionScoreDto,
		user: User,
	): Promise<StudentCriterionScore[]> {
		const { studentId, instituteId, activityId, criterionId } = query;

		const where: any = {
			institute: { id: instituteId },
			activity: { id: activityId },
			criterion: { id: criterionId },
		};

		if (user.rol === Role.Student) {
			const userGroup = await this.userRepository.findOne({
				where: { id: user.id },
				relations: ['groups', 'groups.group'],
			});

			const activeGroup = userGroup.groups.find((g) => g.group.active);

			if (activeGroup) {
				const groupUsers = await this.userRepository.find({
					where: { groups: { id: activeGroup.group.id } },
				});
				where.student = { id: In(groupUsers.map((u) => u.id)) };
			} else {
				where.student = { id: user.id };
			}
		} else if (studentId) {
			where.student = { id: studentId };
		}

		return this.studentCriterionScoreRepository.find({
			where,
			relations: ['student', 'activity', 'criterion', 'institute'],
		});
	}

	async findOne(id: number, user: User): Promise<StudentCriterionScore> {
		const score = await this.studentCriterionScoreRepository.findOne({
			where: { id },
			relations: ['student', 'activity', 'criterion', 'user', 'institute'],
		});

		if (!score) {
			throw new NotFoundException(
				`StudentCriterionScore with ID ${id} not found`,
			);
		}

		if (user.rol === Role.Student) {
			const userGroup = await this.userRepository.findOne({
				where: { id: user.id },
				relations: ['groups', 'groups.group'],
			});

			const activeGroup = userGroup.groups.find((g) => g.group.active);

			if (activeGroup) {
				const groupUsers = await this.userRepository.find({
					where: { groups: { id: activeGroup.group.id } },
				});
				const groupUserIds = groupUsers.map((u) => u.id);
				if (!groupUserIds.includes(score.student.id)) {
					throw new UnauthorizedException(
						`You are not authorized to view this score.`,
					);
				}
			} else if (score.student.id !== user.id) {
				throw new UnauthorizedException(
					`You are not authorized to view this score.`,
				);
			}
		}

		if (user.rol !== Role.Admin && score.institute.id !== user.institute.id) {
			throw new ForbiddenException(
				`You are not authorized to view scores from other institutes.`,
			);
		}

		return score;
	}

	async update(
		id: number,
		updateStudentCriterionScoreDto: UpdateStudentCriterionScoreDto,
		user: User,
	): Promise<StudentCriterionScore> {
		const score = await this.studentCriterionScoreRepository.findOneBy({ id });
		if (!score) {
			throw new NotFoundException(
				`StudentCriterionScore with ID ${id} not found`,
			);
		}

		if (user.rol !== Role.Admin && score.institute.id !== user.institute.id) {
			throw new ForbiddenException(
				`You are not authorized to update scores from other institutes.`,
			);
		}

		let student: User | undefined;
		if (updateStudentCriterionScoreDto.studentId) {
			student = await this.userRepository.findOne({
				where: { id: updateStudentCriterionScoreDto.studentId },
			});
			if (!student) {
				throw new NotFoundException(
					`Student with ID ${updateStudentCriterionScoreDto.studentId} not found`,
				);
			}
		}

		let activity: Activity | undefined;
		if (updateStudentCriterionScoreDto.activityId) {
			activity = await this.activityRepository.findOne({
				where: { id: updateStudentCriterionScoreDto.activityId },
			});
			if (!activity) {
				throw new NotFoundException(
					`Activity with ID ${updateStudentCriterionScoreDto.activityId} not found`,
				);
			}
		}

		let criterion: Criterion | undefined;
		if (updateStudentCriterionScoreDto.criterionId) {
			criterion = await this.criterionRepository.findOne({
				where: { id: updateStudentCriterionScoreDto.criterionId },
				relations: ['activity'],
			});
			if (!criterion) {
				throw new NotFoundException(
					`Criterion with ID ${updateStudentCriterionScoreDto.criterionId} not found`,
				);
			}
			if (activity && criterion.activity.id !== activity.id) {
				throw new NotFoundException(
					`Criterion with ID ${updateStudentCriterionScoreDto.criterionId} does not belong to Activity with ID ${updateStudentCriterionScoreDto.activityId}`,
				);
			}
		}

		let institute: Institute | undefined;
		if (updateStudentCriterionScoreDto.instituteId) {
			institute = await this.instituteRepository.findOne({
				where: { id: updateStudentCriterionScoreDto.instituteId },
			});
			if (!institute) {
				throw new NotFoundException(
					`Institute with ID ${updateStudentCriterionScoreDto.instituteId} not found`,
				);
			}
		}

		const updatedScore: StudentCriterionScore =
			await this.studentCriterionScoreRepository.preload({
				id,
				score: updateStudentCriterionScoreDto.score,
				student,
				activity,
				criterion,
				institute,
				gradedBy: user,
				gradedAt: new Date(),
			});

		return this.studentCriterionScoreRepository.save(updatedScore);
	}

	async remove(id: number, user: User): Promise<void> {
		const score = await this.studentCriterionScoreRepository.findOneBy({ id });
		if (!score) {
			throw new NotFoundException(
				`StudentCriterionScore with ID ${id} not found`,
			);
		}

		// Only Admin can delete scores
		if (user.rol !== Role.Admin) {
			throw new UnauthorizedException(
				`You are not authorized to delete this score.`,
			);
		}

		if (user.rol !== Role.Admin && score.institute.id !== user.institute.id) {
			throw new ForbiddenException(
				`You are not authorized to delete scores from other institutes.`,
			);
		}

		const result = await this.studentCriterionScoreRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(
				`StudentCriterionScore with ID ${id} not found`,
			);
		}
	}
}
