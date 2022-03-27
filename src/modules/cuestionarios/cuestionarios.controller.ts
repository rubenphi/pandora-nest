import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Cuestionario } from './cuestionario.entity';
import { CuestionariosService } from './cuestionarios.service';
import { CreateCuestionarioDto, UpdateCuestionarioDto } from './dto';

@Controller('cuestionarios')

@Controller('cuestionarios')
export class CuestionariosController {
    constructor(private readonly cuestionarioService: CuestionariosService) {}
	@Get()
	getCuestionarios(): Promise<Cuestionario[]> {
		return this.cuestionarioService.getCuestionarios();
	}
	@Get(':id')
	getCuestionario(@Param('id') id: number): Promise<Cuestionario> {
		return this.cuestionarioService.getCuestionario(id);
	}

	@Post()
	createCuestionario(@Body() cuestionario: CreateCuestionarioDto): Promise<Cuestionario> {
		return this.cuestionarioService.createCuestionario(cuestionario);
	}

	@Patch(':id')
	updateCuestionario(
		@Param('id') id: number,
		@Body() cuestionario: UpdateCuestionarioDto,
	): Promise<Cuestionario> {
		return this.cuestionarioService.updateCuestionario(id, cuestionario);
	}
	@Delete(':id')
	deleteCuestionario(@Param('id') id: number): Promise<void> {
		return this.cuestionarioService.deleteCuestionario(id);
	}
}
