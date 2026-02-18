import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch, // Import Patch
	Post,
	Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User as UserEntity } from '../users/user.entity';
import {
	AssignAreaTeacherDto,
	CreateCourseDto,
	QueryCourseDto,
	QueryCourseAreaDto,
	QueryUsersOfCourseDto,
	RemoveUserFromCourseDto,
	UpdateCourseDto,
	UpdateCourseAreaTeacherDto,
	AssignAreaToCourseDto, // Import UpdateCourseAreaTeacherDto
} from './dto';
import { Auth, User } from 'src/common/decorators';
import { CoursesService } from './courses.service';
import { Course } from './course.entity';
import { Role, Roles } from '../auth/roles.decorator';
import { CourseArea } from './course-area.entity';
import { CourseAreaTeacher } from './course-area-teacher.entity';
import { AddUserToCourseDto } from './dto/add-user.dto';
import { UserToCourse } from '../users/userToCourse.entity';

@ApiTags('Courses Routes')
@Controller('courses')
export class CoursesController {
	constructor(private readonly courseService: CoursesService) {}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all courses' })
	@ApiResponse({ status: 200, description: 'Return all courses.' })
	getCourses(
		@Query() queryCourse: QueryCourseDto,
		@User() user: UserEntity,
	): Promise<Course[]> {
		return this.courseService.getCourses(queryCourse, user);
	}
	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a course by id' })
	@ApiResponse({ status: 200, description: 'Return a course.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Course> {
		return this.courseService.getCourse(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a course' })
	@ApiResponse({ status: 201, description: 'The course has been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createCourse(
		@Body() course: CreateCourseDto,
		@User() user: UserEntity,
	): Promise<Course> {
		return this.courseService.createCourse(course, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a course' })
	@ApiResponse({ status: 200, description: 'The course has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	updateCourse(
		@Param('id') id: number,
		@Body() course: UpdateCourseDto,
		@User() user: UserEntity,
	): Promise<Course> {
		return this.courseService.updateCourse(id, course, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a course' })
	@ApiResponse({ status: 200, description: 'The course has been successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	deleteCourse(@Param('id') id: number): Promise<void> {
		return this.courseService.deleteCourse(id);
	}
	@Auth()
	@Get(':id/areas')
	@ApiOperation({ summary: 'Get areas by course' })
	@ApiResponse({ status: 200, description: 'Return areas.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getAreasByCourse(
		@Param('id') id: number,
		@Query() queryCourseAreas: QueryCourseAreaDto,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getAreasByCourse(id, user, queryCourseAreas);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post(':id/areas')
	@ApiBody({ type: [AssignAreaToCourseDto] }) // For Swagger documentation
	@ApiOperation({ summary: 'Add area to course' })
	@ApiResponse({ status: 201, description: 'Area has been successfully added to course.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	addAreaToCourse(
		@Param('id') id: number,
		@Body() assignAreaDtos: AssignAreaToCourseDto[], // Changed DTO
		@User() user: UserEntity,
	): Promise<CourseArea[]> {
		// Changed return type
		return this.courseService.addAreaToCourse(id, assignAreaDtos, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Delete(':id/areas')
	@ApiBody({ type: [Number] }) // For Swagger documentation, assuming array of numbers
	@ApiOperation({ summary: 'Delete area from course' })
	@ApiResponse({ status: 200, description: 'Area has been successfully deleted from course.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	deleteAreaToCourse(
		@Param('id') id: number,
		@Body() areaIdsToDelete: number[], // Changed DTO
		@User() user: UserEntity,
	): Promise<void> {
		// Changed return type
		return this.courseService.deleteAreaFromCourse(id, areaIdsToDelete, user);
	}
	@Auth()
	@Get(':id/areas-teachers')
	@ApiOperation({ summary: 'Get course areas teachers' })
	@ApiResponse({ status: 200, description: 'Return course areas teachers.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getCourseAreasTeachers(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getCourseAreasTeachers(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post(':id/areas-teachers')
	@ApiOperation({ summary: 'Assign area teacher' })
	@ApiResponse({ status: 201, description: 'Area teacher has been successfully assigned.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	assignAreaTeacher(
		@Param('id') id: number,
		@Body() assignDto: AssignAreaTeacherDto,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.assignAreaTeacher(id, assignDto, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch('areas-teachers/:assignmentId')
	@ApiOperation({ summary: 'Update course area teacher' })
	@ApiResponse({ status: 200, description: 'Course area teacher has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'Course area teacher not found.' })
	async updateCourseAreaTeacher(
		@Param('assignmentId') assignmentId: number,
		@Body() updateDto: UpdateCourseAreaTeacherDto,
		@User() user: UserEntity,
	): Promise<CourseAreaTeacher> {
		return await this.courseService.updateCourseAreaTeacher(
			assignmentId,
			updateDto,
			user,
		);
	}
	@Auth()
	@Get(':id/groups')
	@ApiOperation({ summary: 'Get groups by course' })
	@ApiResponse({ status: 200, description: 'Return groups.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getGroupsByCourse(
		@Param('id') id: number,
		@Query('year') year: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getGroupsByCourse(id, year, user);
	}
	@Auth()
	@Get(':id/lessons')
	@ApiOperation({ summary: 'Get lessons by course' })
	@ApiResponse({ status: 200, description: 'Return lessons.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getLessonsByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getLessonsByCourse(id, user);
	}

	@Auth()
	@Get(':id/users')
	@ApiOperation({ summary: 'Get users by course' })
	@ApiResponse({ status: 200, description: 'Return users.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getUsersByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
		@Query() queryUser: QueryUsersOfCourseDto,
	): Promise<any> {
		return this.courseService.getUsersByCourse(id, user, queryUser);
	}

	@Auth()
	@Get(':id/usersNoGroup')
	@ApiOperation({ summary: 'Get users without group by course' })
	@ApiResponse({ status: 200, description: 'Return users.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	getUsersWhithoutGroup(
		@Param('id') id: number,
		@User() user: UserEntity,
		@Query() queryUser: QueryUsersOfCourseDto,
	): Promise<any> {
		return this.courseService.getUsersWhithoutGroup(id, user, queryUser);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post(':id/users')
	@ApiBody({ type: [AddUserToCourseDto] })
	@ApiOperation({ summary: 'Add user to course' })
	@ApiResponse({ status: 201, description: 'User has been successfully added to course.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	addUserToCourse(
		@Param('id') id: number,
		@Body() usersToAdd: AddUserToCourseDto[],
		@User() user: UserEntity,
	) {
		return this.courseService.addUserToCourse(id, usersToAdd, user);
	}

	@Auth()
	@Get('teacher-assignments/:teacherId')
	@ApiOperation({ summary: 'Get teacher assignments' })
	@ApiResponse({ status: 200, description: 'Return teacher assignments.' })
	@ApiResponse({ status: 404, description: 'Teacher not found.' })
	getTeacherAssignments(
		@Param('teacherId') teacherId: number,
		@User() user: UserEntity,
	): Promise<CourseAreaTeacher[]> {
		return this.courseService.getTeacherAssignments(teacherId, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Delete(':id/users')
	@ApiOperation({ summary: 'Remove user from course' })
	@ApiResponse({ status: 200, description: 'User has been successfully removed from course.' })
	@ApiResponse({ status: 404, description: 'Course not found.' })
	removeUserFromCourse(
		@Param('id') id: number,
		@Body() usersToRemove: RemoveUserFromCourseDto,
		@User() user: UserEntity,
	): Promise<UserToCourse> {
		return this.courseService.removeUserFromCourse(id, usersToRemove, user);
	}
}
