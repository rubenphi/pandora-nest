import {
	Controller,
	Get,
	Param,
	Post,
	Query,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import {
	CreateCourseDto,
	UpdateCourseDto,
	QueryCourseDto,
	AssignAreaToCourseDto,
	QueryCourseAreaDto, // New import
} from './dto';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { AddUserToCourseDto } from './dto/add-user.dto';
import { RemoveUserFromCourseDto } from './dto/remove-users.dto';
import { QueryUsersOfCourseDto } from './dto/query-user.dto';
import { UserToCourse } from '../users/userToCourse.entity';
import { AssignAreaTeacherDto } from './dto';
import { CourseArea } from './course-area.entity'; // New import for return type

@ApiTags('Courses Routes')
@Controller('courses')
export class CoursesController {
	constructor(private readonly courseService: CoursesService) {}

	@Auth()
	@Get()
	getCourses(
		@Query() queryCourse: QueryCourseDto,
		@User() user: UserEntity,
	): Promise<Course[]> {
		return this.courseService.getCourses(queryCourse, user);
	}
	@Auth()
	@Get(':id')
	getCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Course> {
		return this.courseService.getCourse(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	createCourse(
		@Body() course: CreateCourseDto,
		@User() user: UserEntity,
	): Promise<Course> {
		return this.courseService.createCourse(course, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
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
	deleteCourse(@Param('id') id: number): Promise<void> {
		return this.courseService.deleteCourse(id);
	}
	@Auth()
	@Get(':id/areas')
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
	getCourseAreasTeachers(
		@Param('id') id: number,
		@Query('year') year: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getCourseAreasTeachers(id, year, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post(':id/areas-teachers')
	assignAreaTeacher(
		@Param('id') id: number,
		@Body() assignDto: AssignAreaTeacherDto,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.assignAreaTeacher(id, assignDto, user);
	}
	@Auth()
	@Get(':id/groups')
	getGroupsByCourse(
		@Param('id') id: number,
		@Query('year') year: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getGroupsByCourse(id, year, user);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getLessonsByCourse(id, user);
	}

	@Auth()
	@Get(':id/users')
	getUsersByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
		@Query() queryUser: QueryUsersOfCourseDto,
	): Promise<any> {
		return this.courseService.getUsersByCourse(id, user, queryUser);
	}

	@Auth()
	@Get(':id/usersNoGroup')
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
	addUserToCourse(
		@Param('id') id: number,
		@Body() usersToAdd: AddUserToCourseDto[],
		@User() user: UserEntity,
	) {
		return this.courseService.addUserToCourse(id, usersToAdd, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Delete(':id/users')
	removeUserFromCourse(
		@Param('id') id: number,
		@Body() usersToRemove: RemoveUserFromCourseDto,
		@User() user: UserEntity,
	): Promise<UserToCourse> {
		return this.courseService.removeUserFromCourse(id, usersToRemove, user);
	}
}
