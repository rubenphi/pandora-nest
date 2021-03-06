import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Query,
	Delete,
	UploadedFile,
	UseInterceptors,
	UseFilters,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';

import { DeleteFileException } from 'src/exceptions/deleteFileException';
import { Question } from './question.entity';
import { QuestionsService } from './questions.service';
import {
	CreateQuestionDto,
	UpdateQuestionDto,
	ImportFromQuestionDto,
	QueryQuestionDto,
} from './dto';
import { Option } from '../options/option.entity';
import { Answer } from '../answers/answer.entity';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';

@ApiTags('Questions Routes')
@Controller('questions')
export class QuestionsController {
	constructor(private readonly questionService: QuestionsService) {}
	@Auth()
	@Get()
	getQuestions(@Query() queryQuestion: QueryQuestionDto): Promise<Question[]> {
		return this.questionService.getQuestions(queryQuestion);
	}
	@Auth()
	@Get(':id')
	getQuestion(@Param('id') id: number): Promise<Question> {
		return this.questionService.getQuestion(id);
	}
	@Auth()
	@Post()
	@UseFilters(DeleteFileException)
	@UseInterceptors(
		FileInterceptor('photo', {
			storage: diskStorage({
				destination: './uploads',
				filename: function (req, file, cb) {
					cb(null, `${uuid()}${extname(file.originalname)}`);
				},
			}),
		}),
	)
	createQuestion(
		@Body() question: CreateQuestionDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Question> {
		if (file) {
			question.photo = 'uploads/' + file.filename;
		} else {
			question.photo = null;
		}
		return this.questionService.createQuestion(question);
	}
	@Auth()
	@Patch(':id')
	@UseFilters(DeleteFileException)
	@UseInterceptors(
		FileInterceptor('photo', {
			storage: diskStorage({
				destination: './uploads',
				filename: function (req, file, cb) {
					cb(null, `${uuid()}${extname(file.originalname)}`);
				},
			}),
		}),
	)
	updateQuestion(
		@Param('id') id: number,
		@Body() question: UpdateQuestionDto,
		@UploadedFile() file: Express.Multer.File,
	): Promise<Question> {
		if (file) {
			question.photo = 'uploads/' + file.filename;
		}
		return this.questionService.updateQuestion(id, question);
	}
	@Auth()
	@Delete(':id')
	deleteQuestion(@Param('id') id: number): Promise<void> {
		return this.questionService.deleteQuestion(id);
	}
	@Auth()
	@Get(':id/options')
	getOptionByQuestion(@Param('id') id: number): Promise<Option[]> {
		return this.questionService.getOptionsByQuestion(id);
	}
	@Auth()
	@Get(':id/answers')
	getAnswersByQuestion(@Param('id') id: number): Promise<Answer[]> {
		return this.questionService.getAnswersByQuestion(id);
	}
	@Auth()
	@Patch(':id/options/import')
	importOptionsToQuestion(
		@Param('id') id: number,
		@Body() ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Option[]> {
		return this.questionService.importOptionsToQuestion(
			id,
			ImportFromQuestionDto,
		);
	}
	@Auth()
	@Patch(':id/photo/import')
	importPhotoToQuestion(
		@Param('id') id: number,
		@Body() ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Question> {
		return this.questionService.importPhotoToQuestion(
			id,
			ImportFromQuestionDto,
		);
	}
}
