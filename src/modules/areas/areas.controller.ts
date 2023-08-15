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
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';

@ApiTags('Areas Routes')
@Controller('areas')
export class AreasController {
	constructor(private readonly areaService: AreasService) {}
	@Auth()
	@Get()
	getAreas( queryArea: QueryAreaDto, @User() user: UserEntity): Promise<Area[]> {
		return this.areaService.getAreas(queryArea, user);
	}

	@Auth()
	@Get(':id')
	getArea(@Param('id') id: number, @User() user: UserEntity): Promise<Area> {
		return this.areaService.getArea(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post()
	createArea(@Body() area: CreateAreaDto, @User() user: UserEntity): Promise<Area> {
		return this.areaService.createArea(area, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch(':id')
	updateArea(
		@Param('id') id: number,
		@Body() area: UpdateAreaDto,
		@User() user: UserEntity,)
	: Promise<Area> {
		return this.areaService.updateArea(id, area,user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteArea(@Param('id') id: number): Promise<void> {
		return this.areaService.deleteArea(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByArea(@Param('id') id: number, @User() user: UserEntity): Promise<Lesson[]> {
		return this.areaService.getLessonsByArea(id, user);
	}
}
