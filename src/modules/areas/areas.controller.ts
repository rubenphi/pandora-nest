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

import { Area } from './area.entity';
import { Lesson } from '../lessons/lesson.entity';
import { AreasService } from './areas.service';
import { CreateAreaDto, UpdateAreaDto, QueryAreaDto } from './dto';
@Controller('areas')
export class AreasController {
    constructor(private readonly areaService: AreasService) {}
	@Get()
	getAreas(@Query() queryArea: QueryAreaDto): Promise<Area[]> {
		return this.areaService.getAreas(queryArea);
	}
	@Get(':id')
	getArea(@Param('id') id: number): Promise<Area> {
		return this.areaService.getArea(id);
	}

	@Post()
	createArea(@Body() area: CreateAreaDto): Promise<Area> {
		return this.areaService.createArea(area);
	}

	@Patch(':id')
	updateArea(
		@Param('id') id: number,
		@Body() area: UpdateAreaDto,
	): Promise<Area> {
		return this.areaService.updateArea(id, area);
	}
	@Delete(':id')
	deleteArea(@Param('id') id: number): Promise<void> {
		return this.areaService.deleteArea(id);
	}

	@Get(':id/Lessons')
	getLessonsByArea(@Param('id') id: number): Promise<Lesson[]> {
		return this.areaService.getLessonsByArea(id);
	}
}
