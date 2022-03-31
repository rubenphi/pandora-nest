import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

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
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploadas',
				filename: function (req, file, cb) {
					cb(null, file.originalname + '_' + Date.now());
				},
			}),
		}),
	)
	createPregunta(
		@Body() pregunta: CreatePreguntaDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Pregunta> {
		pregunta.photo = file.filename;
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
