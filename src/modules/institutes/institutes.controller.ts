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

import { Institute } from './institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import { InstitutesService } from './institutes.service';
import {
	CreateInstituteDto,
	UpdateInstituteDto,
	QueryInstituteDto,
} from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { QueryUsersOfCourseDto } from '../courses/dto/query-user.dto';

@ApiTags('Institutes Routes')
@Controller('institutes')
export class InstitutesController {
	constructor(private readonly instituteService: InstitutesService) {}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all institutes' })
	@ApiResponse({ status: 200, description: 'Return all institutes.' })
	getInstitutes(
		@Query() queryInstitute: QueryInstituteDto,
	): Promise<Institute[]> {
		return this.instituteService.getInstitutes(queryInstitute);
	}
	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get an institute by id' })
	@ApiResponse({ status: 200, description: 'Return an institute.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	getInstitute(@Param('id') id: number): Promise<Institute> {
		return this.instituteService.getInstitute(id);
	}
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create an institute' })
	@ApiResponse({ status: 201, description: 'The institute has been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createInstitute(
		@Body() institute: CreateInstituteDto,
		@User() user: UserEntity,
	): Promise<Institute> {
		return this.instituteService.createInstitute(institute, user);
	}
	@Roles(Role.Admin, Role.Director)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update an institute' })
	@ApiResponse({ status: 200, description: 'The institute has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	updateInstitute(
		@Param('id') id: number,
		@Body() institute: UpdateInstituteDto,
		@User() user: UserEntity,
	): Promise<Institute> {
		return this.instituteService.updateInstitute(id, institute, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete an institute' })
	@ApiResponse({ status: 200, description: 'The institute has been successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	deleteInstitute(@Param('id') id: number): Promise<void> {
		return this.instituteService.deleteInstitute(id);
	}
	@Auth()
	@Get(':id/lessons')
	@ApiOperation({ summary: 'Get lessons by institute' })
	@ApiResponse({ status: 200, description: 'Return lessons.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	getLessonsByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Lesson[]> {
		return this.instituteService.getLessonsByInstitute(id, user);
	}
	@Auth()
	@Get(':id/courses')
	@ApiOperation({ summary: 'Get courses by institute' })
	@ApiResponse({ status: 200, description: 'Return courses.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	getCoursesByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Course[]> {
		return this.instituteService.getCoursesByInstitute(id, user);
	}

	@Auth()
	@Get(':id/usersNoCourse')
	@ApiOperation({ summary: 'Get users without course by institute' })
	@ApiResponse({ status: 200, description: 'Return users.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	getUsersWhithoutCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
		@Query() queryUser: QueryUsersOfCourseDto,
	): Promise<any> {
		return this.instituteService.getUsersWhithoutCourse(id, user, queryUser);
	}

	@Auth()
	@Get(':id/groups')
	@ApiOperation({ summary: 'Get groups by institute' })
	@ApiResponse({ status: 200, description: 'Return groups.' })
	@ApiResponse({ status: 404, description: 'Institute not found.' })
	getGroupsByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Group[]> {
		return this.instituteService.getGroupsByInstitute(id, user);
	}
}
