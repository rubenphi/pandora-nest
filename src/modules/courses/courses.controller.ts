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
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import {
	CreateCourseDto,
	UpdateCourseDto,
	AddAreaToCourseDto,
	DeleteAreaFromCourseDto,
	QueryCourseDto,
} from './dto';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('Courses Routes')
@Controller('courses')
export class CoursesController {
	constructor(private readonly courseService: CoursesService) {}

	@Roles(Role.Admin)
	@Auth()
	@Get()
	getCourses(@Query() queryCourse: QueryCourseDto): Promise<Course[]> {
		return this.courseService.getCourses(queryCourse);
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
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getAreasByCourse(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post(':id/areas')
	addAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: AddAreaToCourseDto,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.addAreaToCourse(id, courseAreas, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Delete(':id/areas')
	deleteAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: DeleteAreaFromCourseDto,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.deleteAreaToCourse(id, courseAreas, user);
	}
	@Auth()
	@Get(':id/groups')
	getGroupsByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getGroupsByCourse(id, user);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.courseService.getLessonsByCourse(id, user);
	}
}
