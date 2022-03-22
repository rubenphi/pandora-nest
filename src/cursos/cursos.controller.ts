import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Patch,
  Delete,
} from '@nestjs/common';
import { Curso } from './curso.entity';
import { CursosService } from './cursos.service';

@Controller('cursos')
export class CursosController {
constructor(private readonly cursoService: CursosService){

}
  @Get()
  getCursos(): Curso[] {
    return this.cursoService.getCursos();
  }
  @Get(':id')
  getCurso(@Param('id') id: string): Curso {
    return this.cursoService.getCurso(id);
  }

  @Post()
  createCurso(@Body() curso: any): void {
    return this.cursoService.createCurso(curso);
  }

  @Patch(':id')
  updateCurso(@Param('id') id: string , @Body() curso: any): Curso {
    return this.cursoService.updateCurso(id, curso)
  }
  @Delete(':id')
  deleteCurso(@Param('id') id: string): void {
    return this.cursoService.deleteCurso(id);
  }
}
