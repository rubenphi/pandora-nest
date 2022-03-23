import { Injectable, NotFoundException } from '@nestjs/common';
import { Curso } from './curso.entity';
import { CreateCursoDto, UpdateCursoDto } from './dto';

@Injectable()
export class CursosService {
	private cursos: Curso[] = [
		{
			id: '1',
			name: '901',
			exist: true,
		},
	];

	getCursos(): Curso[] {
		return this.cursos;
	}
	getCurso(id: string): Curso {
		const curso = this.cursos.find((curso) => curso.id == id);
		if (!curso) {
			throw new NotFoundException('Curso no encontrado');
		}
		return curso;
	}
	createCurso(cursoDto: CreateCursoDto) {
		this.cursos.push({
			id: (Math.floor(Math.random() * 2000) + 1).toString(),
			name: cursoDto.name,
			exist: true,
		});
	}
	updateCurso(id: string, cursoDto: UpdateCursoDto) {
		const curso: Curso = this.getCurso(id);
		curso.exist = cursoDto.exist;
		curso.name = cursoDto.name;
		return curso;
	}

	deleteCurso(id: string) {
		const index = this.cursos.findIndex((curso) => curso.id === id);
		if (index >= 0) {
			this.cursos.splice(index, 1);
		}
	}
}
