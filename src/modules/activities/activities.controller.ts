import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	ParseIntPipe,
	Patch,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, QueryActivityDto, UpdateActivityDto } from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from 'src/modules/auth/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { User as UserEntity } from 'src/modules/users/user.entity';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivitiesController {
	constructor(private readonly activitiesService: ActivitiesService) {}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a new activity' })
	@ApiResponse({ status: 201, description: 'Activity successfully created.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async create(
		@Body() createActivityDto: CreateActivityDto,
		@User() user: UserEntity,
	) {
		return this.activitiesService.create(createActivityDto, user);
	}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all activities with filters' })
	@ApiResponse({ status: 200, description: 'List of activities.' })
	async findAll(@Query() query: QueryActivityDto) {
		return this.activitiesService.findAll(query);
	}

	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get an activity by ID' })
	@ApiResponse({ status: 200, description: 'Activity found.' })
	@ApiResponse({ status: 404, description: 'Activity not found.' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.activitiesService.findOne(id);
	}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update an activity by ID' })
	@ApiResponse({ status: 200, description: 'Activity successfully updated.' })
	@ApiResponse({ status: 404, description: 'Activity not found.' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateActivityDto: UpdateActivityDto,
	) {
		return this.activitiesService.update(id, updateActivityDto);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete an activity by ID' })
	@ApiResponse({ status: 200, description: 'Activity successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Activity not found.' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		return this.activitiesService.remove(id);
	}
}
