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
import { Auth } from 'src/common/decorators';

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
	getOption(@Param('id') id: number): Promise<Option> {
		return this.optionService.getOption(id);
	}
	@Auth()
	@Post()
	createOption(@Body() option: CreateOptionDto): Promise<Option> {
		return this.optionService.createOption(option);
	}
	@Auth()
	@Patch(':id')
	updateOption(
		@Param('id') id: number,
		@Body() option: UpdateOptionDto,
	): Promise<Option> {
		return this.optionService.updateOption(id, option);
	}
	@Auth()
	@Delete(':id')
	deleteOption(@Param('id') id: number): Promise<void> {
		return this.optionService.deleteOption(id);
	}
	@Auth()
	@Get(':id/answers')
	getAnswersByOption(@Param('id') id: number): Promise<Answer[]> {
		return this.optionService.getAnswersByOption(id);
	}
}
