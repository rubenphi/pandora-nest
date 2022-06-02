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
import { Auth } from 'src/common/decorators';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import {
	CreateCourseDto,
	UpdateCourseDto,
	AddAreaToCourseDto,
	DeleteAreaFromCourseDto,
	QueryCourseDto,
} from './dto';

@ApiTags('Courses Routes')
@Controller('courses')
export class CoursesController {
	constructor(private readonly courseService: CoursesService) {}
	@Auth()
	@Get()
	getCourses(@Query() queryCourse: QueryCourseDto): Promise<Course[]> {
		return this.courseService.getCourses(queryCourse);
	}
	@Auth()
	@Get(':id')
	getCourse(@Param('id') id: number): Promise<Course> {
		return this.courseService.getCourse(id);
	}
	@Auth()
	@Post()
	createCourse(@Body() course: CreateCourseDto): Promise<Course> {
		return this.courseService.createCourse(course);
	}
	@Auth()
	@Patch(':id')
	updateCourse(
		@Param('id') id: number,
		@Body() course: UpdateCourseDto,
	): Promise<Course> {
		return this.courseService.updateCourse(id, course);
	}
	@Auth()
	@Delete(':id')
	deleteCourse(@Param('id') id: number): Promise<void> {
		return this.courseService.deleteCourse(id);
	}
	@Auth()
	@Get(':id/areas')
	getAreasByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getAreasByCourse(id);
	}
	@Auth()
	@Post(':id/areas')
	addAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: AddAreaToCourseDto,
	): Promise<any> {
		return this.courseService.addAreaToCourse(id, courseAreas);
	}
	@Auth()
	@Delete(':id/areas')
	deleteAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: DeleteAreaFromCourseDto,
	): Promise<any> {
		return this.courseService.deleteAreaToCourse(id, courseAreas);
	}
	@Auth()
	@Get(':id/groups')
	getGroupsByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getGroupsByCourse(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getLessonsByCourse(id);
	}
}
