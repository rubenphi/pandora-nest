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
import { CreateLessonDto, UpdateLessonDto, QueryLessonDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';

@ApiTags('Lessons Routes')
@Controller('lessons')
export class LessonsController {
	constructor(private readonly lessonService: LessonsService) {}
	@Auth()
	@Get()
	getLessons(
		@Query() queryLesson: QueryLessonDto,
		@User() user: UserEntity,
	): Promise<Lesson[]> {
		return this.lessonService.getLessons(queryLesson, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Get('full')
	@ApiOperation({ summary: 'Get lessons with full enriched data' })
	@ApiBearerAuth()
	@ApiResponse({ status: 200, description: 'Lessons with materials, quiz questions and activities' })
	getFullLessons(@Query() queryLesson: QueryLessonDto): Promise<any[]> {
		return this.lessonService.getFullLessons(queryLesson);
	}

	@Auth()
	@Get(':id')
	getLesson(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Lesson> {
		return this.lessonService.getLesson(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	createLesson(
		@Body() lesson: CreateLessonDto,
		@User() user: UserEntity,
	): Promise<Lesson> {
		return this.lessonService.createLesson(lesson, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateLesson(
		@Param('id') id: number,
		@Body() lesson: UpdateLessonDto,
		@User() user: UserEntity,
	): Promise<Lesson> {
		return this.lessonService.updateLesson(id, lesson, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Delete(':id')
	deleteLesson(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<void> {
		return this.lessonService.deleteLesson(id, user);
	}

	@Auth()
	@Get(':id/quizzes')
	getQuizzesByLesson(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Quiz[]> {
		return this.lessonService.getQuizzesByLesson(id, user);
	}
}
