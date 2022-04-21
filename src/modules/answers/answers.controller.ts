import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Answer } from './answer.entity';
import { AnswersService } from './answers.service';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';

@Controller('answers')
export class AnswersController {
	constructor(private readonly answerService: AnswersService) {}
	@Get()
	getAnswers(): Promise<Answer[]> {
		return this.answerService.getAnswers();
	}
	@Get(':id')
	getAnswer(@Param('id') id: number): Promise<Answer> {
		return this.answerService.getAnswer(id);
	}

	@Get('lesson/:id')
	getAnswerByLesson(@Param('id') id: number): Promise<Answer[]> {
		return this.answerService.getAnswersByLesson(id);
	}

	@Get('lesson/result/:id')
	getAnswerByLessonSum(@Param('id') id: number): Promise<Answer[]> {
		return this.answerService.getAnswersByLessonSum(id);
	}

	@Get('question/:id')
	getAnswerByQuestion(@Param('id') id: number): Promise<Answer[]> {
		return this.answerService.getAnswersByQuestion(id);
	}

	@Get('question/bonus/:id')
	bonusToAnswer(@Param('id') id: number): Promise<Answer[]> {
		return this.answerService.bonusToAnswer(id);
	}

	@Post()
	createAnswer(@Body() answer: CreateAnswerDto): Promise<Answer> {
		return this.answerService.createAnswer(answer);
	}

	@Patch(':id')
	updateAnswer(
		@Param('id') id: number,
		@Body() answer: UpdateAnswerDto,
	): Promise<Answer> {
		return this.answerService.updateAnswer(id, answer);
	}
	@Delete(':id')
	deleteAnswer(@Param('id') id: number): Promise<void> {
		return this.answerService.deleteAnswer(id);
	}
}
