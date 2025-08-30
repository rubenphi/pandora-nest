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
	CreateStudentCriterionPermissionDto,
	UpdateStudentCriterionPermissionDto,
	QueryStudentCriterionPermissionDto,
} from './dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from 'src/modules/auth/roles.decorator';

import { User as UserEntity } from 'src/modules/users/user.entity';

@ApiTags('student-criterion-scores')
@Controller('student-criterion-scores')
export class StudentCriterionScoresController {
	constructor(
		private readonly studentCriterionScoresService: StudentCriterionScoresService,
	) {}

	// ---------- SCORES ----------
	@Auth()
	@Post('create')
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
	@Get('getAll')
	@ApiOperation({ summary: 'Get all student criterion scores with filters' })
	@ApiResponse({ status: 200, description: 'List of scores.' })
	async findAll(
		@Query() query: QueryStudentCriterionScoreDto,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.findAll(query, user);
	}

	@Auth()
	@Patch('update/:id')
	@ApiOperation({ summary: 'Update a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score successfully updated.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async update(
		@Param('id') id: number,
		@Body() updateStudentCriterionScoreDto: UpdateStudentCriterionScoreDto,
		@User() user: UserEntity,
	) {
		return this.studentCriterionScoresService.update(
			id,
			updateStudentCriterionScoreDto,
			user,
		);
	}

	@Auth()
	@Get('getOne/:id')
	@ApiOperation({ summary: 'Get a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score found.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async findOne(@Param('id') id: number, @User() user: UserEntity) {
		return this.studentCriterionScoresService.findOne(id, user);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete('delete/:id')
	@ApiOperation({ summary: 'Delete a student criterion score by ID' })
	@ApiResponse({ status: 200, description: 'Score successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Score not found.' })
	async remove(@Param('id') id: number, @User() user: UserEntity) {
		return this.studentCriterionScoresService.remove(id, user);
	}

	// ---------- PERMISSIONS ----------
	@Auth()
	@Post('permissions')
	@ApiOperation({ summary: 'Create a new student criterion permission' })
	@ApiResponse({ status: 201, description: 'Permission successfully created.' })
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async createPermission(
		@Body()
		createStudentCriterionPermissionDto: CreateStudentCriterionPermissionDto,
	) {
		return this.studentCriterionScoresService.createPermission(
			createStudentCriterionPermissionDto,
		);
	}

	@Auth()
	@Post('permissions/bulk')
	@ApiOperation({ summary: 'Create multiple student criterion permissions' })
	@ApiResponse({
		status: 201,
		description: 'Permissions successfully created.',
	})
	@ApiResponse({ status: 400, description: 'Bad Request.' })
	async createPermissionsBulk(
		@Body() createPermissionsDto: CreateStudentCriterionPermissionDto[],
	) {
		return this.studentCriterionScoresService.bulkCreatePermissions(
			createPermissionsDto,
		);
	}

	@Auth()
	@Get('permissions')
	findAllPermissions(
		@Query() queryPermission: QueryStudentCriterionPermissionDto,
	): Promise<any> {
		return this.studentCriterionScoresService.findAllPermissions(
			queryPermission,
		);
	}

	@Auth()
	@Get('permissions/:id')
	@ApiOperation({ summary: 'Get a student criterion permission by ID' })
	@ApiResponse({ status: 200, description: 'Permission found.' })
	@ApiResponse({ status: 404, description: 'Permission not found.' })
	async findOnePermission(@Param('id') id: number) {
		return this.studentCriterionScoresService.findOnePermission(id);
	}

	@Auth()
	@Patch('permissions/:id')
	@ApiOperation({ summary: 'Update a student criterion permission by ID' })
	@ApiResponse({ status: 200, description: 'Permission successfully updated.' })
	@ApiResponse({ status: 404, description: 'Permission not found.' })
	async updatePermission(
		@Param('id') id: number,
		@Body()
		updateStudentCriterionPermissionDto: UpdateStudentCriterionPermissionDto,
	) {
		return this.studentCriterionScoresService.updatePermission(
			id,
			updateStudentCriterionPermissionDto,
		);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete('permissions/:id')
	@ApiOperation({ summary: 'Delete a student criterion permission by ID' })
	@ApiResponse({ status: 200, description: 'Permission successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Permission not found.' })
	async removePermission(@Param('id') id: number) {
		return this.studentCriterionScoresService.removePermission(id);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete('permissions')
	@ApiOperation({ summary: 'Delete all permissions for an activity' })
	@ApiResponse({
		status: 200,
		description: 'Permissions successfully deleted.',
	})
	async removePermissionsByActivity(@Query('activityId') activityId: number) {
		return this.studentCriterionScoresService.deletePermissionsByActivity(
			activityId,
		);
	}
}
