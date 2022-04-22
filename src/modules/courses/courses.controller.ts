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
import { CreateCourseDto, UpdateCourseDto, AddAreaToCourseDto, DeleteAreaFromCourseDto } from './dto';

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

	@Post('add/area')
	addAreaToCourse(@Body() courseArea: AddAreaToCourseDto): Promise<any> {
		return this.courseService.addAreaToCourse(courseArea);
	}

	@Post('delete/area')
	deleteAreaToCourse(@Body() courseArea: DeleteAreaFromCourseDto): Promise<any> {
		return this.courseService.deleteAreaToCourse(courseArea);
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
