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
import { StudentCriterionScoresService } from './student-criterion-scores.service';
import {
	CreateStudentCriterionScoreDto,
	QueryStudentCriterionScoreDto,
	UpdateStudentCriterionScoreDto,
} from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from 'src/modules/auth/roles.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { User as UserEntity } from 'src/modules/users/user.entity';

@ApiTags('student-criterion-scores')
@Controller('student-criterion-scores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentCriterionScoresController {
	constructor(
		private readonly studentCriterionScoresService: StudentCriterionScoresService,
	) {}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a new student criterion score' })
	@ApiResponse({ status: 201, description: 'Score successfully created.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async create(
		@Body() createStudentCriterionScoreDto: CreateStudentCriterionScoreDto,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.create(
			createStudentCriterionScoreDto,
			user,
		);
	}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all student criterion scores with filters' })
	@ApiResponse({ status: 200, description: 'List of scores.' })
	async findAll(
		@Query() query: QueryStudentCriterionScoreDto,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.findAll(query, user);
	}

	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score found.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async findOne(
		@Param('id', ParseIntPipe) id: number,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.findOne(id, user);
	}

	@Roles(Role.Admin, Role.Teacher)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score successfully updated.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateStudentCriterionScoreDto: UpdateStudentCriterionScoreDto,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.update(
			id,
			updateStudentCriterionScoreDto,
			user,
		);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async remove(
		@Param('id', ParseIntPipe) id: number,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.remove(id, user);
	}
}
