import {
	Controller,
	Get,
	Param,
	Post,
	Query,
	Body,
	Patch,
	Delete,
	Req,
	ForbiddenException,
} from '@nestjs/common';

import { Area } from './area.entity';
import { Lesson } from '../lessons/lesson.entity';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto, QueryAreaDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';
import { AbilityFactory, Action } from '../ability/ability.factory';


@ApiTags('Areas Routes')
@Controller('areas')
export class AreasController {
	constructor(
		private readonly areaService: AreasService,
		private abilityFactory: AbilityFactory,
	) {}
	@Auth()
	@Get()
	getAreas(@Req() req, @Query() queryArea: QueryAreaDto): Promise<Area[]> {
		const ability = this.abilityFactory.defineAbility(req.user);
		const isAllowed = ability.can(Action.Read, Area);
		if(!isAllowed){
			throw new ForbiddenException("only admin");
		}
		return this.areaService.getAreas(queryArea);
	}
	@Auth()
	@Get(':id')
	getArea(@Param('id') id: number): Promise<Area> {
		return this.areaService.getArea(id);
	}
	@Auth()
	@Post()
	createArea(@Body() area: CreateAreaDto): Promise<Area> {
		return this.areaService.createArea(area);
	}
	@Auth()
	@Patch(':id')
	updateArea(
		@Param('id') id: number,
		@Body() area: UpdateAreaDto,
	): Promise<Area> {
		return this.areaService.updateArea(id, area);
	}
	@Auth()
	@Delete(':id')
	deleteArea(@Param('id') id: number): Promise<void> {
		return this.areaService.deleteArea(id);
	}
	@Auth()
	@Get(':id/Lessons')
	getLessonsByArea(@Param('id') id: number): Promise<Lesson[]> {
		return this.areaService.getLessonsByArea(id);
	}
}
