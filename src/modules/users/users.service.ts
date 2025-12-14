import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike, In } from 'typeorm';

import { User } from './user.entity';
import {
	CreateUserDto,
	UpdateUserDto,
	QueryUserDto,
	CreateBulkUserDto,
} from './dto';
import { Institute } from '../institutes/institute.entity';
import { Invitation } from '../invitations/invitation.entity';
import { Course } from '../courses/course.entity'; // Already imported
import { UserToCourse } from './userToCourse.entity';
import { QueryUserCoursesDto } from './dto/query-users-courses.dto';
import { QueryUserGroupsDto } from './dto/query-users-group.dto';
import { UserToGroup } from './userToGroup.entity';
import { Role } from '../auth/roles.decorator';
import { UserToGroupDto } from './dto/user-to-group.dto';
import { AssignmentType } from './dto/deactivate-user-assignments.dto';
import { Group } from '../groups/group.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Invitation)
		private readonly invitationRepository: Repository<Invitation>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
		@InjectRepository(UserToGroup)
		private readonly userToGroupsRepository: Repository<UserToGroup>,
		@InjectRepository(Course) // Inject CourseRepository
		private readonly courseRepository: Repository<Course>,
	) {}

	async getUsers(queryUser: QueryUserDto): Promise<User[]> {
		if (Object.entries(queryUser).length != 0) {
			const { rol, instituteId, name, lastName, code, ...rest } = queryUser;
			return await this.userRepository.find({
				where: {
					...rest,
					name: name ? ILike(`%${name}%`) : undefined,
					lastName: lastName ? ILike(`%${lastName}%`) : undefined,
					rol: rol ? In(rol) : undefined,
					code: code ? In(code) : undefined,
					institute: instituteId ? { id: instituteId } : undefined,
				},
				relations: ['institute'],
			});
		} else {
			return await this.userRepository.find();
		}
	}

	async getUserByCode(code: string, user?: User) {
		const userToReturn = await this.userRepository
			.createQueryBuilder('user')
			.leftJoinAndSelect('user.institute', 'institute')
			.where({ code })
			.addSelect('user.password')
			.getOne();

		if (user && user.institute.id !== userToReturn.institute.id) {
			throw new ForbiddenException('You are not allowed to see this user');
		}

		return userToReturn;
	}
	async getUser(id: number, user?: User): Promise<User> {
		const userToReturn: User = await this.userRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});
		if (user && user.institute.id !== userToReturn.institute.id) {
			throw new ForbiddenException('You are not allowed to see this user');
		}
		return userToReturn;
	}
	async createUser(userDto: CreateUserDto, userLoged: User): Promise<User> {
		const countUsers = await this.userRepository.count();

		const sameEmail = await this.userRepository.findOne({
			where: { email: userDto.email },
		});
		const sameCode = await this.userRepository.findOne({
			where: { code: userDto.code },
		});

		if (sameEmail && userDto.email) {
			throw new BadRequestException(
				'You cannot create two users with the same email',
			);
		} else if (sameCode) {
			throw new BadRequestException(
				'You cannot create two users with the same code',
			);
		}

		const invitation: Invitation = await this.invitationRepository.findOne({
			where: { code: userDto.instituteInvitation, valid: true },
			relations: ['institute'],
		});

		let institute = invitation?.institute ?? null;
		if (
			institute === null &&
			userLoged?.rol !== Role.Admin &&
			userLoged?.rol !== Role.Director &&
			userLoged?.rol !== Role.Coordinator &&
			countUsers != 0
		) {
			throw new BadRequestException('Invalid invitation');
		}

		if (
			(institute === null && userLoged?.rol === Role.Admin) ||
			userLoged?.rol === Role.Director ||
			userLoged?.rol === Role.Coordinator
		) {
			institute = userLoged.institute;
		}

		const user: User = await this.userRepository.create({
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			institute,
			password: userDto.password,
			rol: 'user',
			exist: userDto.exist,
		});
		const returnUser = await this.userRepository
			.save(user)
			.then(async (user) => {
				if (invitation) {
					await this.invitationRepository.update(invitation.id, {
						valid: false,
					});
				}

				return user;
			});
		delete returnUser.password;
		return returnUser;
	}

	async createBulkUsers(
		createBulkUserDto: CreateBulkUserDto,
		userLoged: User,
	): Promise<User[]> {
		const createdUsers: User[] = [];
		for (const userItemDto of createBulkUserDto.users) {
			// Extract CreateUserDto properties for the base user creation
			const baseUserDto: CreateUserDto = {
				name: userItemDto.name,
				lastName: userItemDto.lastName,
				email: userItemDto.email,
				code: userItemDto.code,
				password: userItemDto.password,
				exist: userItemDto.exist,
				instituteInvitation: userItemDto.instituteInvitation, // This will be undefined for bulk imports, which is fine
			};

			// Create the user using the base createUser logic
			const createdUser = await this.createUser(baseUserDto, userLoged);

			// Now handle systemRol and course assignment for the bulk user
			if (createdUser) {
				// Update the user's role based on systemRol from bulk DTO
				createdUser.rol = userItemDto.systemRol;
				await this.userRepository.save(createdUser);

				// Handle course assignment only if the user is a student and courseId is provided
				if (userItemDto.systemRol === 'student' && userItemDto.courseId) {
					const course = await this.courseRepository
						.findOneOrFail({
							where: { id: userItemDto.courseId },
						})
						.catch(() => {
							throw new NotFoundException(
								`Course with ID ${userItemDto.courseId} not found`,
							);
						});

					const userToCourse = this.userToCourseRepository.create({
						user: { id: createdUser.id },
						course: course, // Assign the fetched course entity
						rol: 'student', // Default to 'student' role for course assignment
						year: new Date().getFullYear(), // Assuming current year for assignment
						active: true,
					});
					await this.userToCourseRepository.save(userToCourse);
				}
			}
			createdUsers.push(createdUser);
		}
		return createdUsers;
	}

	async updateUser(
		id: number,
		userDto: UpdateUserDto,
		user: User,
	): Promise<User> {
		if (
			user.id !== id &&
			user.rol !== Role.Admin &&
			user.rol !== Role.Director &&
			user.rol !== Role.Coordinator
		) {
			throw new ForbiddenException('You are not allowed to update this user');
		}

		const sameEmail = await this.userRepository.findOne({
			where: { email: userDto.email, id: Not(id) },
		});
		const sameCode = await this.userRepository.findOne({
			where: { code: userDto.code, id: Not(id) },
		});

		if (sameEmail && userDto.email) {
			throw new BadRequestException(
				'You cannot create two users with the same email',
			);
		} else if (sameCode) {
			throw new BadRequestException(
				'You cannot create two users with the same code',
			);
		}
		const invitation: Invitation = await this.invitationRepository.findOne({
			where: { code: userDto.instituteInvitation, valid: true },
			relations: ['institute'],
		});
		const userToUpdate: User = await this.userRepository.preload({
			id: id,
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			rol: userDto.rol,
			password: userDto.password,
			exist: userDto.exist,
		});

		if (!userToUpdate) {
			throw new NotFoundException('The user you want to update does not exist');
		}
		if (invitation) {
			userToUpdate.institute = invitation.institute;
		}
		const returnUser = await this.userRepository
			.save(userToUpdate)
			.then(async (user) => {
				if (invitation) {
					await this.invitationRepository.update(invitation.id, {
						valid: false,
					});
				}
				return user;
			});
		delete returnUser.password;
		return returnUser;
	}

	async deleteUser(id: number): Promise<void> {
		const user: User = await this.userRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The user you want to delete does not exist',
				);
			});
		this.userRepository.remove(user);
	}

	async getUserCourses(
		queryCourses: QueryUserCoursesDto,
		id: number,
	): Promise<UserToCourse[]> {
		if (id) {
			return await this.userToCourseRepository.find({
				where: {
					year: queryCourses.year,
					user: { id },
				},
				relations: ['course', 'course.areas'],
			});
		} else {
			throw new ForbiddenException('userId is required');
		}
	}
	async getUserGroups(
		queryGroups: QueryUserGroupsDto,
		id: number,
	): Promise<UserToGroup[]> {
		if (id) {
			return await this.userToGroupsRepository.find({
				where: {
					active: queryGroups.active,

					user: { id },
				},
				relations: ['group'],
			});
		} else {
			throw new ForbiddenException('userId is required');
		}
	}
	async addUserToGroup(
		userToGroup: UserToGroupDto,
		userLoged: User,
	): Promise<UserToGroup> {
		// Fetch the group to get its associated course
		const group = await this.userToGroupsRepository.manager
			.findOneOrFail(Group, {
				where: { id: userToGroup.groupId },
				relations: ['course'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});

		let requiresAuthorizationCode = true;

		if (userLoged?.rol === Role.Admin) {
			requiresAuthorizationCode = false;
		} else if (userLoged?.rol === Role.Teacher) {
			// Check if the teacher is an admin of the course associated with the group
			const teacherCourseAdmin = await this.userToCourseRepository.findOne({
				where: {
					user: { id: userLoged.id },
					course: { id: group.course.id },
					rol: Role.Admin, // Assuming 'admin' is the role for course administrators
					active: true,
				},
			});
			if (teacherCourseAdmin) {
				requiresAuthorizationCode = false;
			}
		}

		if (requiresAuthorizationCode) {
			const autorizacion = await this.invitationRepository.findOne({
				where: { code: userToGroup.code, valid: true },
			});
			if (!autorizacion) {
				throw new BadRequestException('Invalid autorization code');
			}
			await this.invitationRepository.update(autorizacion.id, { valid: false });
		}
		const actualGroup: UserToGroup =
			await this.userToGroupsRepository.findOneBy({
				user: { id: userToGroup.userId },
				active: true,
			});

		const userToGroupSave: UserToGroup = this.userToGroupsRepository.create({
			group: { id: userToGroup.groupId },
			user: { id: userToGroup.userId },
			year: userToGroup.year,
			active: true,
		});

		return this.userToGroupsRepository.save(userToGroupSave).then(() => {
			if (actualGroup) {
				actualGroup.active = false;
				this.userToGroupsRepository.save(actualGroup);
			}

			return userToGroupSave;
		});
	}

	async deactivateUserAssignments(
		userId: number,
		assignmentTypes: AssignmentType[],
	): Promise<void> {
		if (assignmentTypes.includes(AssignmentType.COURSE)) {
			const assignments: UserToCourse[] =
				await this.userToCourseRepository.find({
					where: { user: { id: userId }, active: true },
				});
			for await (const assignment of assignments) {
				await this.userToCourseRepository.update(assignment.id, {
					active: false,
				});
			}
		}

		if (assignmentTypes.includes(AssignmentType.GROUP)) {
			const groupAssignments: UserToGroup[] =
				await this.userToGroupsRepository.find({
					where: { user: { id: userId }, active: true },
				});
			for await (const assignment of groupAssignments) {
				await this.userToGroupsRepository.update(assignment.id, {
					active: false,
				});
			}
		}
	}
}
