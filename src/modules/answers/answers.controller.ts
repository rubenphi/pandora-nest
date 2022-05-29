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
import { Answer } from './answer.entity';
import { AnswersService } from './answers.service';
import { CreateAnswerDto, UpdateAnswerDto, QueryAnswerDto } from './dto';

@ApiTags('Answers Routes')
@Controller('answers')
export class AnswersController {
	constructor(private readonly answerService: AnswersService) {}
	@Get()
	getAnswers(@Query() queryAnswer: QueryAnswerDto): Promise<Answer[]> {
		return this.answerService.getAnswers(queryAnswer);
	}
	@Get(':id')
	getAnswer(@Param('id') id: number): Promise<Answer> {
		return this.answerService.getAnswer(id);
	}

	@Get('question/bonus/:id')
	bonusToAnswer(@Param('id') id: number): Promise<Answer> {
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
