import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Course } from './course.entity';
import { Area } from '../areas/area.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	CreateCourseDto,
	UpdateCourseDto,
	QueryCourseDto,
	QueryCourseAreaDto,
	UpdateCourseAreaTeacherDto,
} from './dto';
import { AssignAreaToCourseDto } from './dto/assign-area-to-course.dto'; // New import
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';
import { AddUserToCourseDto } from './dto/add-user.dto';
import { UserToCourse } from '../users/userToCourse.entity';
import { RemoveUserFromCourseDto } from './dto/remove-users.dto';
import { QueryUsersOfCourseDto } from './dto/query-user.dto';
import { UserToGroup } from '../users/userToGroup.entity';
import { CourseAreaTeacher } from './course-area-teacher.entity';
import { AssignAreaTeacherDto } from './dto/assign-area-teacher.dto';
import { CourseArea } from './course-area.entity'; // New import

@Injectable()
export class CoursesService {
	constructor(
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
		@InjectRepository(UserToGroup)
		private readonly userToGroupRepository: Repository<UserToGroup>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(CourseAreaTeacher)
		private readonly courseAreaTeacherRepository: Repository<CourseAreaTeacher>,
		@InjectRepository(CourseArea) // New repository injection
		private readonly courseAreaRepository: Repository<CourseArea>,
	) {}

	async getCourseAreasTeachers(
		id: number,
		user: User,
	): Promise<CourseAreaTeacher[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to see areas of this course',
			);
		}

		return await this.courseAreaTeacherRepository.find({
			where: { course: { id } },
			relations: ['area', 'teacher'],
		});
	}

	async assignAreaTeacher(
		id: number,
		assignDto: AssignAreaTeacherDto,
		user: User,
	): Promise<CourseAreaTeacher> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute', 'courseAreas.area'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to assign areas to this course',
			);
		}

		const area = await this.areaRepository.findOneBy({ id: assignDto.areaId });
		if (!area) {
			throw new NotFoundException('Area not found');
		}

		// Ensure area is linked to course
		if (!course.courseAreas.find((a) => a.area.id === area.id && a.active)) {
			course.courseAreas.push(
				this.courseAreaRepository.create({
					course,
					area,
					start_date: new Date(),
					end_date: null,
					active: true,
				}) as CourseArea,
			);
			await this.courseRepository.save(course);
		}

		let teacher = null;
		if (assignDto.teacherId) {
			teacher = await this.userRepository.findOneBy({
				id: assignDto.teacherId,
			});
			if (!teacher) {
				throw new NotFoundException('Teacher not found');
			}
		}

		//check if area is already assigned to teacher
		const assignment = await this.courseAreaTeacherRepository.findOne({
			where: {
				course: { id },
				area: { id: assignDto.areaId },
				teacher: { id: assignDto.teacherId },
				active: true,
			},
		});
		if (assignment) {
			return assignment;
		}

		// Simply create a new assignment without checking for existence
		const newAssignment = this.courseAreaTeacherRepository.create({
			course,
			area,
			teacher,
			active: assignDto.active !== undefined ? assignDto.active : true,
		});

		return await this.courseAreaTeacherRepository.save(newAssignment);
	}

	async deleteAreaTeacher(
		id: number,
		areaId: number,
		user: User,
	): Promise<void> {
		const assignment = await this.courseAreaTeacherRepository.findOneOrFail({
			where: { course: { id }, area: { id: areaId } },
			relations: ['course', 'course.institute'],
		});

		if (
			user.rol !== Role.Admin &&
			user.institute.id !== assignment.course.institute.id
		) {
			throw new ForbiddenException(
				'You are not allowed to delete this assignment',
			);
		}

		await this.courseAreaTeacherRepository.remove(assignment);
	}

	async updateCourseAreaTeacher(
		assignmentId: number,
		updateDto: UpdateCourseAreaTeacherDto,
		user: User,
	): Promise<CourseAreaTeacher> {
		const assignment = await this.courseAreaTeacherRepository.findOneOrFail({
			where: { id: assignmentId },
			relations: ['course', 'course.institute'],
		});

		if (
			user.rol !== Role.Admin &&
			user.institute.id !== assignment.course.institute.id
		) {
			throw new ForbiddenException(
				'You are not allowed to update this assignment',
			);
		}

		if (updateDto.active !== undefined) {
			assignment.active = updateDto.active;
		}

		if (updateDto.teacherId !== undefined) {
			if (updateDto.teacherId === null) {
				assignment.teacher = null;
			} else {
				const teacher = await this.userRepository.findOneBy({
					id: updateDto.teacherId,
				});
				if (!teacher) {
					throw new NotFoundException('Teacher not found');
				}
				assignment.teacher = teacher;
			}
		}

		return await this.courseAreaTeacherRepository.save(assignment);
	}

	async getTeacherAssignments(
		teacherId: number,
		user: User,
	): Promise<CourseAreaTeacher[]> {
		// Ensure the requesting user is either an Admin/Director/Coordinator
		// or the teacher themselves.
		if (
			user.rol !== Role.Admin &&
			user.rol !== Role.Director &&
			user.rol !== Role.Coordinator &&
			user.id !== teacherId
		) {
			throw new ForbiddenException(
				'You are not allowed to see these assignments',
			);
		}

		return await this.courseAreaTeacherRepository.find({
			where: { teacher: { id: teacherId } },
			relations: ['area', 'course', 'course.institute'],
		});
	}

	async getCourses(queryCourse: QueryCourseDto, user: User): Promise<Course[]> {
		if (queryCourse) {
			return await this.courseRepository.find({
				where: {
					name: queryCourse.name,
					exist: queryCourse.exist,
					institute: {
						id:
							user.rol == Role.Admin
								? queryCourse.instituteId
								: user.institute.id,
					},
				},
				relations: ['institute'],
			});
		} else {
			return await this.courseRepository.find({ relations: ['institute'] });
		}
	}
	async getCourse(id: number, user: User): Promise<Course> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see a course');
		}

		return course;
	}
	async createCourse(courseDto: CreateCourseDto, user: User): Promise<Course> {
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== courseDto.instituteId
		) {
			throw new ForbiddenException('You are not allowed to create this course');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: courseDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const course: Course = await this.courseRepository.create({
			name: courseDto.name,
			institute,
			exist: courseDto.exist,
		});
		return this.courseRepository.save(course);
	}
	async updateCourse(
		id: number,
		courseDto: UpdateCourseDto,
		user: User,
	): Promise<Course> {
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== courseDto.instituteId
		) {
			throw new ForbiddenException('You are not allowed to update this course');
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: courseDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const course: Course = await this.courseRepository.preload({
			id: id,
			name: courseDto.name,
			institute,
			exist: courseDto.exist,
		});
		if (!course) {
			throw new NotFoundException(
				'The course you want to update does not exist',
			);
		}
		return this.courseRepository.save(course);
	}

	async deleteCourse(id: number): Promise<void> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The course you want to delete does not exist',
				);
			});
		this.courseRepository.remove(course);
	}

	async addAreaToCourse(
		id: number,
		assignAreaDtos: AssignAreaToCourseDto[], // Changed parameter type
		user: User,
	): Promise<CourseArea[]> {
		// Changed return type
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'], // 'areas' relation is no longer needed here
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to add areas to this course',
			);
		}

		const createdCourseAreas: CourseArea[] = [];

		for (const assignDto of assignAreaDtos) {
			const area = await this.areaRepository.findOneBy({
				id: assignDto.areaId,
			});
			if (!area) {
				throw new NotFoundException(
					`Area with ID ${assignDto.areaId} not found`,
				);
			}

			// Check if a similar CourseArea assignment already exists
			const existingCourseArea = await this.courseAreaRepository.findOne({
				where: {
					course: { id: course.id },
					area: { id: area.id },
					start_date: assignDto.start_date, // Consider uniqueness based on dates if needed
				},
			});

			if (existingCourseArea) {
				// Optionally update existing or throw error
				throw new BadRequestException(
					`Area ${area.name} is already assigned to this course for the given period.`,
				);
			}

			const courseArea = this.courseAreaRepository.create({
				course,
				area,
				start_date: assignDto.start_date,
				end_date: assignDto.end_date,
				active: assignDto.active !== undefined ? assignDto.active : true,
			});
			createdCourseAreas.push(await this.courseAreaRepository.save(courseArea));
		}

		return createdCourseAreas;
	}

	async deleteAreaFromCourse(
		id: number,
		areaIdsToDelete: number[], // Assuming a simple array of area IDs for deletion
		user: User,
	): Promise<void> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to delete areas from this course',
			);
		}

		for (const areaId of areaIdsToDelete) {
			const courseArea = await this.courseAreaRepository.findOne({
				where: {
					course: { id: course.id },
					area: { id: areaId },
				},
			});

			if (courseArea) {
				await this.courseAreaRepository.remove(courseArea);
			}
		}
	}

	async getAreasByCourse(
		id: number,
		user: User,
		query: QueryCourseAreaDto,
	): Promise<Area[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to see areas of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see areas of this course',
				);
			}
		}

		const courseAreas = await this.courseAreaRepository.find({
			where: { course: { id }, active: query.active },
			relations: ['area'],
		});

		return courseAreas.map((ca) => ca.area);
	}

	async getLessonsByCourse(id: number, user: User): Promise<Lesson[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to see lessons of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see lessons of this course',
				);
			}
		}

		return course.lessons;
	}

	async getGroupsByCourse(
		id: number,
		year: number,
		user: User,
	): Promise<Group[]> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'groups',
					'institute',
					'groups.usersToGroup',
					'groups.usersToGroup.user',
				],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to see groups of this course',
			);
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex((course) => course.id === id);
			if (courseIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to see groups of this course',
				);
			}
		}

		// Filter groups by year if year parameter is provided
		if (year) {
			return course.groups.filter((group) => group.year === Number(year));
		}

		return course.groups;
	}

	async getUsersByCourse(
		id: number,
		user: User,
		queryUser: QueryUsersOfCourseDto,
	): Promise<UserToCourse[]> {
		const course: Course = await this.courseRepository.findOneOrFail({
			where: { id },
			relations: ['institute'],
		});
		const users: UserToCourse[] = await this.userToCourseRepository.find({
			where: { course: { id }, year: queryUser.year, active: queryUser.active },
			relations: ['user'],
		});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see this course');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(course) =>
					course.id === course.course.id && course.year === course.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this course');
			}
		}
		return users;
	}

	async getUsersWhithoutGroup(
		id: number,
		user: User,
		queryUser: QueryUsersOfCourseDto,
	): Promise<UserToCourse[]> {
		const course: Course = await this.courseRepository.findOneOrFail({
			where: { id },
			relations: ['institute', 'groups'],
		});

		// Verificar permisos
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException('You are not allowed to see this course');
		}
		if (user.rol === Role.Student) {
			const studentInSameCourse = user.courses.find(
				(c) => c.id === course.id && c.year === queryUser.year,
			);
			if (!studentInSameCourse) {
				throw new ForbiddenException('You are not allowed to see this course');
			}
		}

		// Subquery para obtener usuarios que están en grupos activos en el mismo año
		const subQuery = this.userToGroupRepository
			.createQueryBuilder('userToGroup')
			.select('userToGroup.userId')
			.innerJoin('userToGroup.group', 'group')
			.where('group.courseId = :courseId', { courseId: id })
			.andWhere('userToGroup.year = :year', { year: queryUser.year })
			.andWhere('userToGroup.active = true');

		// Query principal para obtener los usuarios sin grupo
		const usersWhitoutGroupInSameYear = await this.userToCourseRepository
			.createQueryBuilder('userToCourse')
			.innerJoinAndSelect('userToCourse.user', 'user')
			.where('userToCourse.courseId = :courseId', { courseId: id })
			.andWhere('userToCourse.year = :year', { year: queryUser.year })
			.andWhere(`userToCourse.userId NOT IN (${subQuery.getQuery()})`)
			.setParameters(subQuery.getParameters())
			.getMany();

		return usersWhitoutGroupInSameYear;
	}

	async addUserToCourse(
		id: number,
		usersToAdd: AddUserToCourseDto[],
		user: User,
	) {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to add users to this course',
			);
		}

		// Process each user assignment individually
		for (const userToAdd of usersToAdd) {
			// 1. Deactivate all existing course assignments for this user for the given year
			await this.userToCourseRepository.update(
				{ user: { id: userToAdd.userId }, year: userToAdd.year },
				{ active: false },
			);

			// 2. Check if the user is already in the target course for that year
			const existingAssignment = await this.userToCourseRepository.findOne({
				where: {
					user: { id: userToAdd.userId },
					course: { id },
					year: userToAdd.year,
				},
			});

			if (existingAssignment) {
				// If they are, just reactivate the assignment
				existingAssignment.active = true;
				await this.userToCourseRepository.save(existingAssignment);
			} else {
				// If not, create a new active assignment
				const userToAssign = await this.userRepository.findOneBy({
					id: userToAdd.userId,
				});
				if (!userToAssign) {
					// Optional: throw an error or just skip this user if not found
					continue;
				}
				const newAssignment = this.userToCourseRepository.create({
					user: userToAssign,
					course,
					rol: userToAdd.rol,
					year: userToAdd.year,
					active: true, // Explicitly set as active
				});
				await this.userToCourseRepository.save(newAssignment);
			}
		}

		// Return a success message or the updated list of assignments if needed
		return { message: 'User assignments updated successfully.' };
	}
	async removeUserFromCourse(
		id: number,
		userToRemove: RemoveUserFromCourseDto,
		user: User,
	): Promise<UserToCourse> {
		const course: Course = await this.courseRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Course not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== course.institute.id) {
			throw new ForbiddenException(
				'You are not allowed to delete users to this course',
			);
		}

		const userToDelete: User = await this.userRepository
			.findOneOrFail({
				where: { id: userToRemove.userIdToRemove },
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});

		const userToDeleteFromCourse: UserToCourse =
			await this.userToCourseRepository.findOneOrFail({
				where: {
					user: { id: userToDelete.id },
					course: { id: course.id },
					year: userToRemove.year,
				},
			});

		await this.userToCourseRepository.remove(userToDeleteFromCourse);

		return userToDeleteFromCourse;
	}
}
