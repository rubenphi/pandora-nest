import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Option } from './option.entity';
import { OptionsService } from './options.service';
import { CreateOptionDto, UpdateOptionDto } from './dto';

@Controller('options')
export class OptionsController {
    constructor(private readonly optionService: OptionsService) {}
	@Get()
	getOptions(): Promise<Option[]> {
		return this.optionService.getOptions();
	}

	@Get(':id')
	getOption(@Param('id') id: number): Promise<Option> {
		return this.optionService.getOption(id);
	}

	@Post()
	createOption(@Body() option: CreateOptionDto): Promise<Option> {
		return this.optionService.createOption(option);
	}

	@Patch(':id')
	updateOption(
		@Param('id') id: number,
		@Body() option: UpdateOptionDto,
	): Promise<Option> {
		return this.optionService.updateOption(id, option);
	}
	@Delete(':id')
	deleteOption(@Param('id') id: number): Promise<void> {
		return this.optionService.deleteOption(id);
	}
}
