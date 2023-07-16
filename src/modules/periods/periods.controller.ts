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
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('Periods Routes')
@Controller('periods')
export class PeriodsController {
	constructor(private readonly periodService: PeriodsService) {}
	@Auth()
	@Get()
	getPeriods(@Query() queryPeriod: QueryPeriodDto): Promise<Period[]> {
		return this.periodService.getPeriods(queryPeriod);
	}
	@Auth()
	@Get(':id')
	getPeriod(@Param('id') id: number): Promise<Period> {
		return this.periodService.getPeriod(id);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	createPeriod(@Body() period: CreatePeriodDto): Promise<Period> {
		return this.periodService.createPeriod(period);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
	updatePeriod(
		@Param('id') id: number,
		@Body() period: UpdatePeriodDto,
	): Promise<Period> {
		return this.periodService.updatePeriod(id, period);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deletePeriod(@Param('id') id: number): Promise<void> {
		return this.periodService.deletePeriod(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByPeriod(@Param('id') id: number): Promise<any> {
		return this.periodService.getLessonsByPeriod(id);
	}
}
