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

import { Institute } from './institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import { InstitutesService } from './institutes.service';
import {
	CreateInstituteDto,
	UpdateInstituteDto,
	QueryInstituteDto,
} from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('Institutes Routes')
@Controller('institutes')
export class InstitutesController {
	constructor(private readonly instituteService: InstitutesService) {}

	@Auth()
	@Get()
	getInstitutes(
		@Req() req,
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
	createInstitute(@Body() institute: CreateInstituteDto): Promise<Institute> {
		return this.instituteService.createInstitute(institute);
	}
	@Roles(Role.Admin, Role.Director)
	@Auth()
	@Patch(':id')
	updateInstitute(
		@Param('id') id: number,
		@Body() institute: UpdateInstituteDto,
	): Promise<Institute> {
		return this.instituteService.updateInstitute(id, institute);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	deleteInstitute(@Param('id') id: number): Promise<void> {
		return this.instituteService.deleteInstitute(id);
	}
	@Auth()
	@Get(':id/lessons')
	getLessonsByInstitute(@Param('id') id: number): Promise<Lesson[]> {
		return this.instituteService.getLessonsByInstitute(id);
	}
	@Auth()
	@Get(':id/courses')
	getCoursesByInstitute(@Param('id') id: number): Promise<Course[]> {
		return this.instituteService.getCoursesByInstitute(id);
	}
	@Auth()
	@Get(':id/groups')
	getGroupsByInstitute(@Param('id') id: number): Promise<Group[]> {
		return this.instituteService.getGroupsByInstitute(id);
	}
}
