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
import { QuizzesService } from './quizzes.service';
import { Quiz } from './quiz.entity';
import { CreateQuizDto, UpdateQuizDto, QueryQuizDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { Answer } from '../answers/answer.entity';
import { Question } from '../questions/question.entity';
import { ImportFromLessonDto } from '../lessons/dto/import-from-lesson.dto';
import { ImportQuestionsMixDto } from '../lessons/dto/import-from-lesson-mix.dto';
import { ResultLessonDto } from '../lessons/dto/result-lesson.dto';

@ApiTags('Quizzes Routes')
@Controller('quizzes')
export class QuizzesController {
	constructor(private readonly quizzesService: QuizzesService) {}

	@Auth()
	@Get()
	getQuizzes(@Query() queryQuiz: QueryQuizDto): Promise<Quiz[]> {
		return this.quizzesService.getQuizzes(queryQuiz);
	}

	@Auth()
	@Get(':id')
	getQuiz(@Param('id') id: number, @User() user: UserEntity): Promise<Quiz> {
		return this.quizzesService.getQuiz(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	createQuiz(
		@Body() quiz: CreateQuizDto,
		@User() user: UserEntity,
	): Promise<Quiz> {
		return this.quizzesService.createQuiz(quiz, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateQuiz(
		@Param('id') id: number,
		@Body() quiz: UpdateQuizDto,
		@User() user: UserEntity,
	): Promise<Quiz> {
		return this.quizzesService.updateQuiz(id, quiz, user);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteQuiz(@Param('id') id: number, @User() user: UserEntity): Promise<void> {
		return this.quizzesService.deleteQuiz(id, user);
	}

	@Auth()
	@Get(':id/questions')
	getQuizQuestions(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Question[]> {
		return this.quizzesService.getQuizQuestions(id, user);
	}

	@Auth()
	@Get(':id/answers')
	getAnswersByQuiz(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer[]> {
		return this.quizzesService.getAnswersByQuiz(id, user);
	}

	@Auth()
	@Get(':id/results')
	getResultQuiz(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<ResultLessonDto[]> {
		return this.quizzesService.getResultQuiz(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post(':id/import-questions')
	importQuestionsToQuiz(
		@Param('id') id: number,
		@Body() importFromQuizDto: ImportFromLessonDto,
	): Promise<Question[]> {
		return this.quizzesService.importQuestionsToQuiz(id, importFromQuizDto);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post(':id/import-questions-mix')
	importQuestionsToQuizMix(
		@Body() importQuestionsMixDto: ImportQuestionsMixDto,
	): Promise<Question[]> {
		return this.quizzesService.importQuestionsToQuizMix(importQuestionsMixDto);
	}

	@Auth()
	@Get(':id/points')
	getPointsByQuiz(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<{ points: number }> {
		return this.quizzesService.getPointsByQuiz(id, user);
	}
}
