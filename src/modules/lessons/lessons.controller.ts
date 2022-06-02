import {
	Controller,
	Get,
	Param,
	Query,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Lesson } from './lesson.entity';
import { LessonsService } from './lessons.service';
import { Answer } from '../answers/answer.entity';
import { Question } from '../questions/question.entity';
import {
	CreateLessonDto,
	UpdateLessonDto,
	QueryLessonDto,
	ResultLessonDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';

@ApiTags('Lessons Routes')
@Controller('lessons')
export class LessonsController {
	constructor(private readonly lessonService: LessonsService) {}
	@Auth()
	@Get()
	getLessons(@Query() queryLesson: QueryLessonDto): Promise<Lesson[]> {
		return this.lessonService.getLessons(queryLesson);
	}
	@Auth()
	@Get(':id')
	getLesson(@Param('id') id: number): Promise<Lesson> {
		return this.lessonService.getLesson(id);
	}
	@Auth()
	@Post()
	createLesson(@Body() lesson: CreateLessonDto): Promise<Lesson> {
		return this.lessonService.createLesson(lesson);
	}
	@Auth()
	@Patch(':id')
	updateLesson(
		@Param('id') id: number,
		@Body() lesson: UpdateLessonDto,
	): Promise<Lesson> {
		return this.lessonService.updateLesson(id, lesson);
	}
	@Auth()
	@Delete(':id')
	deleteLesson(@Param('id') id: number): Promise<void> {
		return this.lessonService.deleteLesson(id);
	}

	@Get(':id')
	getLessonResult(@Param('id') id: number): Promise<ResultLessonDto[]> {
		return this.lessonService.getResultLesson(id);
	}

	@Get(':id/answers')
	getAnswersByLesson(@Param('id') id: number): Promise<Answer[]> {
		return this.lessonService.getAnswersByLesson(id);
	}

	@Get(':id/questions')
	getQuestionsByLesson(@Param('id') id: number): Promise<Question[]> {
		return this.lessonService.getQuestionsByLesson(id);
	}
}
