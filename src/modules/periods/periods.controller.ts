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
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('Periods Routes')
@Controller('periods')
export class PeriodsController {
	constructor(private readonly periodService: PeriodsService) {}
	@Auth()
	@Get()
	getPeriods(
		@Query() queryPeriod: QueryPeriodDto,
		@User() user: UserEntity,
	): Promise<Period[]> {
		return this.periodService.getPeriods(queryPeriod, user);
	}
	@Auth()
	@Get(':id')
	getPeriod(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Period> {
		return this.periodService.getPeriod(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	createPeriod(
		@Body() period: CreatePeriodDto,
		@User() user: UserEntity,
	): Promise<Period> {
		return this.periodService.createPeriod(period, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
	updatePeriod(
		@Param('id') id: number,
		@Body() period: UpdatePeriodDto,
		@User() user: UserEntity,
	): Promise<Period> {
		return this.periodService.updatePeriod(id, period, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deletePeriod(@Param('id') id: number): Promise<void> {
		return this.periodService.deletePeriod(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByPeriod(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<any> {
		return this.periodService.getLessonsByPeriod(id, user);
	}
}
