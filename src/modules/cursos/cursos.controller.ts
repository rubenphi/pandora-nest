import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Curso } from './curso.entity';
import { CursosService } from './cursos.service';
import { CreateCursoDto, UpdateCursoDto } from './dto';

@Controller('cursos')
export class CursosController {
	constructor(private readonly cursoService: CursosService) {}
	@Get()
	getCursos(): Promise<Curso[]> {
		return this.cursoService.getCursos();
	}
	@Get(':id')
	getCurso(@Param('id') id: number): Promise<Curso> {
		return this.cursoService.getCurso(id);
	}

	@Post()
	createCurso(@Body() curso: CreateCursoDto): Promise<Curso> {
		return this.cursoService.createCurso(curso);
	}

	@Patch(':id')
	updateCurso(
		@Param('id') id: number,
		@Body() curso: UpdateCursoDto,
	): Promise<Curso> {
		return this.cursoService.updateCurso(id, curso);
	}
	@Delete(':id')
	deleteCurso(@Param('id') id: number): Promise<void> {
		return this.cursoService.deleteCurso(id);
	}
}
