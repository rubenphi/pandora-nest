import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';
import { Pregunta } from './pregunta.entity';
import { PreguntasService } from './preguntas.service';
import { CreatePreguntaDto, UpdatePreguntaDto } from './dto';

@Controller('preguntas')
export class PreguntasController {
	constructor(private readonly preguntaService: PreguntasService) {}
	@Get()
	getPreguntas(): Promise<Pregunta[]> {
		return this.preguntaService.getPreguntas();
	}
	@Get(':id')
	getPregunta(@Param('id') id: number): Promise<Pregunta> {
		return this.preguntaService.getPregunta(id);
	}

	@Post()
	createPregunta(@Body() pregunta: CreatePreguntaDto): Promise<Pregunta> {
		return this.preguntaService.createPregunta(pregunta);
	}

	@Patch(':id')
	updatePregunta(
		@Param('id') id: number,
		@Body() pregunta: UpdatePreguntaDto,
	): Promise<Pregunta> {
		return this.preguntaService.updatePregunta(id, pregunta);
	}
	@Delete(':id')
	deletePregunta(@Param('id') id: number): Promise<void> {
		return this.preguntaService.deletePregunta(id);
	}
}
