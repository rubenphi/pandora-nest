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
	@Get()
	getCourses(@Query() queryCourse: QueryCourseDto): Promise<Course[]> {
		return this.courseService.getCourses(queryCourse);
	}
	@Get(':id')
	getCourse(@Param('id') id: number): Promise<Course> {
		return this.courseService.getCourse(id);
	}

	@Post()
	createCourse(@Body() course: CreateCourseDto): Promise<Course> {
		return this.courseService.createCourse(course);
	}

	@Patch(':id')
	updateCourse(
		@Param('id') id: number,
		@Body() course: UpdateCourseDto,
	): Promise<Course> {
		return this.courseService.updateCourse(id, course);
	}
	@Delete(':id')
	deleteCourse(@Param('id') id: number): Promise<void> {
		return this.courseService.deleteCourse(id);
	}

	@Get(':id/areas')
	getAreasByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getAreasByCourse(id);
	}

	@Post(':id/areas')
	addAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: AddAreaToCourseDto,
	): Promise<any> {
		return this.courseService.addAreaToCourse(id, courseAreas);
	}

	@Delete(':id/areas')
	deleteAreaToCourse(
		@Param('id') id: number,
		@Body() courseAreas: DeleteAreaFromCourseDto,
	): Promise<any> {
		return this.courseService.deleteAreaToCourse(id, courseAreas);
	}

	@Get(':id/groups')
	getGroupsByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getGroupsByCourse(id);
	}

	@Get(':id/lessons')
	getLessonsByCourse(@Param('id') id: number): Promise<any> {
		return this.courseService.getLessonsByCourse(id);
	}
}
