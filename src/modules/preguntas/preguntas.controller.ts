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
	UseFilters,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

import { DeleteFileException } from 'src/Exceptions/deleteFileException';
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
	@UseFilters(DeleteFileException)
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: function (req, file, cb) {
					cb(null, `${uuid()}${extname(file.originalname)}`);
				},
			}),
		}),
	)
	createPregunta(
		@Body() pregunta: CreatePreguntaDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Pregunta> {
		if (file) {
			pregunta.photo = 'uploads/' + file.filename;
		} else {
			pregunta.photo = null;
		}
		return this.preguntaService.createPregunta(pregunta);
	}

	@Patch(':id')
	@UseFilters(DeleteFileException)
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: './uploads',
				filename: function (req, file, cb) {
					cb(null, `${uuid()}${extname(file.originalname)}`);
				},
			}),
		}),
	)
	updatePregunta(
		@Param('id') id: number,
		@Body() pregunta: UpdatePreguntaDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Pregunta> {
		if (file) {
			pregunta.photo = 'uploads/' + file.filename;
		} else {
			pregunta.photo = null;
		}
		return this.preguntaService.updatePregunta(id, pregunta);
	}
	@Delete(':id')
	deletePregunta(@Param('id') id: number): Promise<void> {
		return this.preguntaService.deletePregunta(id);
	}
}
