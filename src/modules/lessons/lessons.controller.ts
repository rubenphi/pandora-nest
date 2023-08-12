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
	ImportFromLessonDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity  } from '../users/user.entity';

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
	getLesson(@Param('id') id: number, @User() user: UserEntity): Promise<Lesson> {
		return this.lessonService.getLesson(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	createLesson(@Body() lesson: CreateLessonDto,@User() user: UserEntity ): Promise<Lesson> {
		return this.lessonService.createLesson(lesson, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateLesson(
		@Param('id') id: number,
		@Body() lesson: UpdateLessonDto,
		@User() user: UserEntity
	): Promise<Lesson> {
		return this.lessonService.updateLesson(id, lesson, user);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteLesson(@Param('id') id: number, @User() user: UserEntity): Promise<void> {
		return this.lessonService.deleteLesson(id, user);
	}

	@Auth()
	@Get(':id')
	getLessonResult(@Param('id') id: number, @User() user: UserEntity): Promise<ResultLessonDto[]> {
		return this.lessonService.getResultLesson(id, user);
	}

	@Auth()
	@Get(':id/answers')
	getAnswersByLesson(@Param('id') id: number, @User() user: UserEntity): Promise<Answer[]> {
		return this.lessonService.getAnswersByLesson(id, user);
	}


	@Auth()                                                 @Get(':id/results')                                     getResultsByLesson(@Param('id') id: number, @User() user: UserEntity): Promise<ResultLessonDto[]> {
                return this.lessonService.getResultLesson(id, user);                                                 }


	@Auth()
	@Get(':id/questions')
	getQuestionsByLesson(@Param('id') id: number, @User() user: UserEntity): Promise<Question[]> {
		return this.lessonService.getQuestionsByLesson(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id/questions/import')
	importQuestionsToLesson(
		@Param('id') id: number,
		@Body() importFromLessonDto: ImportFromLessonDto,
	): Promise<Question[]> {
		return this.lessonService.importQuestionsToLesson(id, importFromLessonDto);
	}
}
