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

	@Post(':id/areas')
	addAreaToCourse(@Param('id') id: number, @Body() courseAreas: AddAreaToCourseDto): Promise<any> {
		return this.courseService.addAreaToCourse(id, courseAreas);
	}

	@Delete(':id/areas')
	deleteAreaToCourse(@Param('id') id: number, @Body() courseAreas: DeleteAreaFromCourseDto): Promise<any> {
		return this.courseService.deleteAreaToCourse(id, courseAreas);
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
