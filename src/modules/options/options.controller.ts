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
import { Option } from './option.entity';
import { OptionsService } from './options.service';
import { CreateOptionDto, UpdateOptionDto, QueryOptionDto } from './dto';
import { Answer } from '../answers/answer.entity';
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('Options Routes')
@Controller('options')
export class OptionsController {
	constructor(private readonly optionService: OptionsService) {}
	@Auth()
	@Get()
	getOptions(@Query() queryOption: QueryOptionDto): Promise<Option[]> {
		return this.optionService.getOptions(queryOption);
	}
	@Auth()
	@Get(':id')
	getOption(@Param('id') id: number, @User() user: UserEntity): Promise<Option> {
		return this.optionService.getOption(id, user);
	}
	@Auth()
	@Post()
	createOption(@Body() option: CreateOptionDto[], @User() user: UserEntity): Promise<Option[]> {
		return this.optionService.createOption(option, user);
	}
	@Auth()
	@Patch(':id')
	updateOption(
		@Param('id') id: number,
		@Body() option: UpdateOptionDto,
		 @User() user: UserEntity
	): Promise<Option> {
		return this.optionService.updateOption(id, option, user);
	}
	@Auth()
	@Delete(':id')
	deleteOption(@Param('id') id: number,@User() user: UserEntity): Promise<void> {
		return this.optionService.deleteOption(id, user);
	}
	@Auth()
	@Get(':id/answers')
	getAnswersByOption(@Param('id') id: number, @User() user: UserEntity): Promise<Answer[]> {
		return this.optionService.getAnswersByOption(id, user);
	}
}
