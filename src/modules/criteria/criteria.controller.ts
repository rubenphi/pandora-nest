
import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Param,
	Body,
	Query,
	UseGuards,
	ParseIntPipe,
} from '@nestjs/common';
import { CriteriaService } from './criteria.service';
import {
	CreateCriterionDto,
	QueryCriterionDto,
	UpdateCriterionDto,
} from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from 'src/modules/auth/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { User as UserEntity } from 'src/modules/users/user.entity';

@ApiTags('criteria')
@Controller('criteria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CriteriaController {
	constructor(private readonly criteriaService: CriteriaService) {}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a new criterion' })
	@ApiResponse({ status: 201, description: 'Criterion successfully created.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async create(
		@Body() createCriterionDto: CreateCriterionDto,
		@User() user: UserEntity,
	) {
		return this.criteriaService.create(createCriterionDto, user);
	}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all criteria with filters' })
	@ApiResponse({ status: 200, description: 'List of criteria.' })
	async findAll(@Query() query: QueryCriterionDto) {
		return this.criteriaService.findAll(query);
	}

	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a criterion by ID' })
	@ApiResponse({ status: 200, description: 'Criterion found.' })
	@ApiResponse({ status: 404, description: 'Criterion not found.' })
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.criteriaService.findOne(id);
	}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a criterion by ID' })
	@ApiResponse({ status: 200, description: 'Criterion successfully updated.' })
	@ApiResponse({ status: 404, description: 'Criterion not found.' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateCriterionDto: UpdateCriterionDto,
	) {
		return this.criteriaService.update(id, updateCriterionDto);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a criterion by ID' })
	@ApiResponse({ status: 200, description: 'Criterion successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Criterion not found.' })
	async remove(@Param('id', ParseIntPipe) id: number) {
		return this.criteriaService.remove(id);
	}
}
