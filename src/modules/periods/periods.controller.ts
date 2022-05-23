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
import { Period } from './period.entity';
import { PeriodsService } from './periods.service';
import { CreatePeriodDto, UpdatePeriodDto, QueryPeriodDto } from './dto';

@Controller('periods')
export class PeriodsController {
	constructor(private readonly periodService: PeriodsService) {}
	@Get()
	getPeriods(@Query() queryPeriod: QueryPeriodDto): Promise<Period[]> {
		return this.periodService.getPeriods(queryPeriod);
	}
	@Get(':id')
	getPeriod(@Param('id') id: number): Promise<Period> {
		return this.periodService.getPeriod(id);
	}

	@Post()
	createPeriod(@Body() period: CreatePeriodDto): Promise<Period> {
		return this.periodService.createPeriod(period);
	}

	@Patch(':id')
	updatePeriod(
		@Param('id') id: number,
		@Body() period: UpdatePeriodDto,
	): Promise<Period> {
		return this.periodService.updatePeriod(id, period);
	}
	@Delete(':id')
	deletePeriod(@Param('id') id: number): Promise<void> {
		return this.periodService.deletePeriod(id);
	}
	
	@Get(':id/lessons')
	getLessonsByPeriod(@Param('id') id: number): Promise<any> {
		return this.periodService.getLessonsByPeriod(id);
	}
}
