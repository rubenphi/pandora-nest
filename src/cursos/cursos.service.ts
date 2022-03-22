import { Injectable } from '@nestjs/common';
import { Curso } from './curso.entity';

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
  getCurso(id: string) {
    return this.cursos.find((curso) => curso.id == id);
  }
  createCurso(cursoI: any) {
    this.cursos.push({
      id: (Math.floor(Math.random() * 2000) + 1).toString(),
      name: cursoI.name,
      exist: true,
    });
  }
  updateCurso(id: string, cursoI: any) {
    const curso: Curso = this.getCurso(id);
    curso.exist = cursoI.exist;
    curso.name = cursoI.name;
    return curso;
  }

  deleteCurso(id: string) {
    const index = this.cursos.findIndex((curso) => curso.id === id);
    if (index >= 0) {
      this.cursos.splice(index, 1);
    }
  }
}
