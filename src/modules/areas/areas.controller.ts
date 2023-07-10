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
} from '@nestjs/common';

import { Area } from './area.entity';
import { Lesson } from '../lessons/lesson.entity';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto, QueryAreaDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('Areas Routes')
@Controller('areas')
export class AreasController {
	constructor(private readonly areaService: AreasService) {}
	@Auth()
	@Get()
	getAreas(@Req() req, @Query() queryArea: QueryAreaDto): Promise<Area[]> {
		return this.areaService.getAreas(queryArea);
	}

	@Auth()
	@Get(':id')
	getArea(@Param('id') id: number): Promise<Area> {
		return this.areaService.getArea(id);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	createArea(@Body() area: CreateAreaDto): Promise<Area> {
		return this.areaService.createArea(area);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
	updateArea(
		@Param('id') id: number,
		@Body() area: UpdateAreaDto,
	): Promise<Area> {
		return this.areaService.updateArea(id, area);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteArea(@Param('id') id: number): Promise<void> {
		return this.areaService.deleteArea(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByArea(@Param('id') id: number): Promise<Lesson[]> {
		return this.areaService.getLessonsByArea(id);
	}
}
