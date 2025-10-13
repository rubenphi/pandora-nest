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
	CreateStudentCriterionPermissionDto,
	UpdateStudentCriterionPermissionDto,
	QueryStudentCriterionPermissionDto,
} from './dto';
import { User } from 'src/modules/users/user.entity';
import { Activity } from 'src/modules/activities/activity.entity';
import { Criterion } from 'src/modules/criteria/criterion.entity';
import { Institute } from 'src/modules/institutes/institute.entity';
import { Role } from 'src/modules/auth/roles.decorator';
import { StudentCriterionPermission } from './student-criterion-permission.entity';

@Injectable()
export class StudentCriterionScoresService {
	constructor(
		@InjectRepository(StudentCriterionScore)
		private readonly studentCriterionScoreRepository: Repository<StudentCriterionScore>,
		@InjectRepository(StudentCriterionPermission)
		private readonly studentCriterionPermissionRepository: Repository<StudentCriterionPermission>,
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
		const permission = await this.studentCriterionPermissionRepository.findOne({
			where: { id: createStudentCriterionScoreDto.permissionId },
		});
		if (user.rol === Role.Student && !permission) {
			throw new UnauthorizedException(
				`Students are not authorized to create scores.`,
			);
		} else if (user.rol === Role.Student && permission) {
			if (permission.reviserType == 'Group') {
				const userGroup = await this.userRepository.findOne({
					where: {
						id: user.id,
						groups: { id: permission.reviserId, group: { active: true } },
					},
					relations: ['groups', 'groups.group'],
				});
				if (!userGroup) {
					throw new UnauthorizedException(
						`You are not authorized to create this score.`,
					);
				}
			} else if (permission.reviserType == 'User') {
				if (permission.reviserId !== user.id) {
					throw new UnauthorizedException(
						`You are not authorized to create this score.`,
					);
				}
			}

			if (permission.revisedType == 'User') {
				if (permission.revisedId !== createStudentCriterionScoreDto.studentId) {
					throw new UnauthorizedException(
						`You are not authorized to create a score for this student.`,
					);
				}
			} else if (permission.revisedType == 'Group') {
				const studentGroup = await this.userRepository.findOne({
					where: {
						id: createStudentCriterionScoreDto.studentId,
						groups: { id: permission.revisedId, group: { active: true } },
					},
					relations: ['groups', 'groups.group'],
				});
				if (!studentGroup) {
					throw new UnauthorizedException(
						`You are not authorized to create a score for this student.`,
					);
				}
			}
		}
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
			relations: ['student', 'activity', 'criterion', 'institute'],
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
		const permission = await this.studentCriterionPermissionRepository.findOne({
			where: { id: updateStudentCriterionScoreDto.permissionId },
		});
		if (user.rol === Role.Student && !permission) {
			throw new UnauthorizedException(
				`Students are not authorized to create scores.`,
			);
		} else if (user.rol === Role.Student && permission) {
			if (permission.reviserType == 'Group') {
				const userGroup = await this.userRepository.findOne({
					where: {
						id: user.id,
						groups: { id: permission.reviserId, group: { active: true } },
					},
					relations: ['groups', 'groups.group'],
				});
				if (!userGroup) {
					throw new UnauthorizedException(
						`You are not authorized to create this score.`,
					);
				}
			} else if (permission.reviserType == 'User') {
				if (permission.reviserId !== user.id) {
					throw new UnauthorizedException(
						`You are not authorized to create this score.`,
					);
				}
			}

			if (permission.revisedType == 'User') {
				if (permission.revisedId !== updateStudentCriterionScoreDto.studentId) {
					throw new UnauthorizedException(
						`You are not authorized to create a score for this student.`,
					);
				}
			} else if (permission.revisedType == 'Group') {
				const studentGroup = await this.userRepository.findOne({
					where: {
						id: updateStudentCriterionScoreDto.studentId,
						groups: { id: permission.revisedId, group: { active: true } },
					},
					relations: ['groups', 'groups.group'],
				});
				if (!studentGroup) {
					throw new UnauthorizedException(
						`You are not authorized to create a score for this student.`,
					);
				}
			}
		}
		const score: StudentCriterionScore =
			await this.studentCriterionScoreRepository.findOne({
				where: { id },
				relations: ['institute'],
			});
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

	async createPermission(
		createStudentCriterionPermissionDto: CreateStudentCriterionPermissionDto,
	): Promise<StudentCriterionPermission> {
		const newPermission: StudentCriterionPermission =
			this.studentCriterionPermissionRepository.create({
				...createStudentCriterionPermissionDto,
				activity: { id: createStudentCriterionPermissionDto.activityId },
			});

		return this.studentCriterionPermissionRepository.save(newPermission);
	}

	async findAllPermissions(
		query: QueryStudentCriterionPermissionDto,
	): Promise<StudentCriterionPermission[]> {
		const where: any = {
			reviserId: query.reviserId,
			revisedId: query.revisedId,
			reviserType: query.reviserType,
			revisedType: query.revisedType,
			expired: query.expired,
			activity: { id: query.activityId },
		};

		const returnData: StudentCriterionPermission[] =
			await this.studentCriterionPermissionRepository.find({
				where,
				relations: ['activity'],
			});

		returnData.forEach((permission) => {
			console.log(JSON.stringify(permission));
		});
		return returnData;
	}

	async findOnePermission(id: number): Promise<StudentCriterionPermission> {
		const permission = await this.studentCriterionPermissionRepository.findOne({
			where: { id },
		});

		if (!permission) {
			throw new NotFoundException(
				`StudentCriterionPermission with ID ${id} not found`,
			);
		}

		return permission;
	}

	async updatePermission(
		id: number,
		updateStudentCriterionPermissionDto: UpdateStudentCriterionPermissionDto,
	): Promise<StudentCriterionPermission> {
		const permission = await this.studentCriterionPermissionRepository.preload({
			id,
			...updateStudentCriterionPermissionDto,
		});

		if (!permission) {
			throw new NotFoundException(
				`StudentCriterionPermission with ID ${id} not found`,
			);
		}

		return this.studentCriterionPermissionRepository.save(permission);
	}

	async removePermission(id: number): Promise<void> {
		const result = await this.studentCriterionPermissionRepository.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException(
				`StudentCriterionPermission with ID ${id} not found`,
			);
		}
	}

	async deletePermissionsByActivity(activityId: number): Promise<void> {
		await this.studentCriterionPermissionRepository.delete({
			activity: { id: activityId },
		});
	}

	async bulkCreatePermissions(
		createPermissionsDto: CreateStudentCriterionPermissionDto[],
	): Promise<any> {
		const activityId = createPermissionsDto[0]?.activityId;
		if (!activityId) {
			// If the payload is empty, we can't know which activity to sync.
			// The frontend should handle this by calling the DELETE endpoint if it wants to clear everything.
			return { created: 0, updated: 0, expired: 0 };
		}

		// 1. Get all existing permissions for the activity.
		const existingPermissions =
			await this.studentCriterionPermissionRepository.find({
				where: { activity: { id: activityId } },
			});

		const summary = { created: 0, updated: 0, expired: 0 };
		const promises = [];

		// Use a Map for efficient lookup of desired permissions.
		const desiredPermissions = new Map<
			string,
			CreateStudentCriterionPermissionDto
		>();
		for (const dto of createPermissionsDto) {
			const key = `${dto.reviserType}-${dto.reviserId}-${dto.revisedType}-${dto.revisedId}`;
			desiredPermissions.set(key, dto);
		}

		// 2. Check existing permissions: expire those no longer desired, or re-activate those that are desired again.
		for (const existing of existingPermissions) {
			const key = `${existing.reviserType}-${existing.reviserId}-${existing.revisedType}-${existing.revisedId}`;
			if (desiredPermissions.has(key)) {
				// It's desired. If it was expired, re-activate it.
				if (existing.expired) {
					existing.expired = false;
					promises.push(
						this.studentCriterionPermissionRepository.save(existing),
					);
					summary.updated++;
				}
				desiredPermissions.delete(key);
			} else {
				// It's not desired. If it's not already expired, expire it.
				if (!existing.expired) {
					existing.expired = true;
					promises.push(
						this.studentCriterionPermissionRepository.save(existing),
					);
					summary.expired++;
				}
			}
		}

		// 3. Create new permissions: any left in the map are new.
		if (desiredPermissions.size > 0) {
			const toCreateDtos = Array.from(desiredPermissions.values());
			// Manually map DTOs to entities to ensure the activity relation is set correctly
			const newPermissionEntities = toCreateDtos.map((dto) => {
				return this.studentCriterionPermissionRepository.create({
					...dto,
					activity: { id: dto.activityId } as Activity,
				});
			});
			promises.push(
				this.studentCriterionPermissionRepository.save(newPermissionEntities),
			);
			summary.created = newPermissionEntities.length;
		}

		await Promise.all(promises);
		return summary;
	}
}
