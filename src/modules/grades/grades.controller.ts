import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { QueryGradeDto } from './dto/query-grade.dto';
import { Grade } from './grade.entity';

@Controller('grades')
export class GradesController {
	constructor(private readonly gradesService: GradesService) {}

	@Post()
	create(@Body() createGradeDto: CreateGradeDto): Promise<Grade> {
		return this.gradesService.create(createGradeDto);
	}

	@Get()
	findAll(@Query() queryGrades: QueryGradeDto): Promise<Grade[]> {
		return this.gradesService.findAll(queryGrades);
	}

	@Get('averages')
	getStudentAverages(
		@Query('courseId') courseId: number,
		@Query('periodId') periodId: number,
		@Query('year') year: number,
	) {
		return this.gradesService.getStudentAverages(courseId, periodId, year);
	}

	@Get(':id')
	findOne(@Param('id') id: string): Promise<Grade> {
		return this.gradesService.findOne(+id);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateGradeDto: UpdateGradeDto,
	): Promise<Grade> {
		return this.gradesService.update(+id, updateGradeDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string): Promise<void> {
		return this.gradesService.remove(+id);
	}
}
