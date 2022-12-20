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
	@Auth()
	@Patch(':id')
	updateInstitute(
		@Param('id') id: number,
		@Body() institute: UpdateInstituteDto,
	): Promise<Institute> {
		return this.instituteService.updateInstitute(id, institute);
	}
	@Auth()
	@Delete(':id')
	deleteInstitute(@Param('id') id: number): Promise<void> {
		return this.instituteService.deleteInstitute(id);
	}
	@Auth()
	@Get(':id/Lessons')
	getLessonsByInstitute(@Param('id') id: number): Promise<Lesson[]> {
		return this.instituteService.getLessonsByInstitute(id);
	}
}
