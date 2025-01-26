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
import { ApiTags } from '@nestjs/swagger';
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
	getInstitutes(
		@Query() queryInstitute: QueryInstituteDto,
	): Promise<Institute[]> {
		return this.instituteService.getInstitutes(queryInstitute);
	}
	@Auth()
	@Get(':id')
	getInstitute(@Param('id') id: number): Promise<Institute> {
		return this.instituteService.getInstitute(id);
	}
	@Auth()
	@Post()
	createInstitute(
		@Body() institute: CreateInstituteDto,
		@User() user: UserEntity,
	): Promise<Institute> {
		return this.instituteService.createInstitute(institute, user);
	}
	@Roles(Role.Admin, Role.Director)
	@Auth()
	@Patch(':id')
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
	deleteInstitute(@Param('id') id: number): Promise<void> {
		return this.instituteService.deleteInstitute(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Lesson[]> {
		return this.instituteService.getLessonsByInstitute(id, user);
	}
	@Auth()
	@Get(':id/courses')
	getCoursesByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Course[]> {
		return this.instituteService.getCoursesByInstitute(id, user);
	}

	@Auth()
	@Get(':id/usersNoCourse')
	getUsersWhithoutCourse(
		@Param('id') id: number,
		@User() user: UserEntity,
		@Query() queryUser: QueryUsersOfCourseDto,
	): Promise<any> {
		return this.instituteService.getUsersWhithoutCourse(id, user, queryUser);
	}

	@Auth()
	@Get(':id/groups')
	getGroupsByInstitute(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Group[]> {
		return this.instituteService.getGroupsByInstitute(id, user);
	}
}
