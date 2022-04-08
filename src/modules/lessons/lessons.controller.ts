import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Lesson } from './lesson.entity';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto';

@Controller('lessons')

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonService: LessonsService) {}
	@Get()
	getLessons(): Promise<Lesson[]> {
		return this.lessonService.getLessons();
	}
	@Get(':id')
	getLesson(@Param('id') id: number): Promise<Lesson> {
		return this.lessonService.getLesson(id);
	}

	@Post()
	createLesson(@Body() lesson: CreateLessonDto): Promise<Lesson> {
		return this.lessonService.createLesson(lesson);
	}

	@Patch(':id')
	updateLesson(
		@Param('id') id: number,
		@Body() lesson: UpdateLessonDto,
	): Promise<Lesson> {
		return this.lessonService.updateLesson(id, lesson);
	}
	@Delete(':id')
	deleteLesson(@Param('id') id: number): Promise<void> {
		return this.lessonService.deleteLesson(id);
	}
}
