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
import { Auth, User } from 'src/common/decorators';
import { Answer } from './answer.entity';
import { AnswersService } from './answers.service';
import { CreateAnswerDto, UpdateAnswerDto, QueryAnswerDto } from './dto';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('Answers Routes')
@Controller('answers')
export class AnswersController {
	constructor(private readonly answerService: AnswersService) {}
	@Roles(Role.Admin)
	@Auth()
	@Get()
	getAnswers(@Query() queryAnswer: QueryAnswerDto): Promise<Answer[]> {
		return this.answerService.getAnswers(queryAnswer);
	}
	@Auth()
	@Get(':id')
	getAnswer(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer> {
		return this.answerService.getAnswer(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('question/:id/bonus')
	bonusToAnswer(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer> {
		return this.answerService.bonusToAnswer(id, user);
	}

	@Auth()
	@Post()
	createAnswer(
		@Body() answer: CreateAnswerDto,
		@User() user: UserEntity,
	): Promise<Answer> {
		return this.answerService.createAnswer(answer, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateAnswer(
		@Param('id') id: number,
		@Body() answer: UpdateAnswerDto,
		@User() user: UserEntity,
	): Promise<Answer> {
		return this.answerService.updateAnswer(id, answer, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteAnswer(@Param('id') id: number): Promise<void> {
		return this.answerService.deleteAnswer(id);
	}
}
