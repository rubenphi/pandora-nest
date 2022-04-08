import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Course } from './course.entity';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto';

@Controller('courses')
export class CoursesController {
	constructor(private readonly courseService: CoursesService) {}
	@Get()
	getCourses(): Promise<Course[]> {
		return this.courseService.getCourses();
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
}
