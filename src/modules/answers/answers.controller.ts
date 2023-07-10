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
import { Auth } from 'src/common/decorators';
import { Answer } from './answer.entity';
import { AnswersService } from './answers.service';
import { CreateAnswerDto, UpdateAnswerDto, QueryAnswerDto } from './dto';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('Answers Routes')
@Controller('answers')
export class AnswersController {
	constructor(private readonly answerService: AnswersService) {}

	@Auth()
	@Get()
	getAnswers(@Query() queryAnswer: QueryAnswerDto): Promise<Answer[]> {
		return this.answerService.getAnswers(queryAnswer);
	}
	@Auth()
	@Get(':id')
	getAnswer(@Param('id') id: number): Promise<Answer> {
		return this.answerService.getAnswer(id);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('question/:id/bonus')
	bonusToAnswer(@Param('id') id: number): Promise<Answer> {
		return this.answerService.bonusToAnswer(id);
	}

	@Auth()
	@Post()
	createAnswer(@Body() answer: CreateAnswerDto): Promise<Answer> {
		return this.answerService.createAnswer(answer);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateAnswer(
		@Param('id') id: number,
		@Body() answer: UpdateAnswerDto,
	): Promise<Answer> {
		return this.answerService.updateAnswer(id, answer);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteAnswer(@Param('id') id: number): Promise<void> {
		return this.answerService.deleteAnswer(id);
	}
}
