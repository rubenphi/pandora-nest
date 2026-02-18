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
	QueryQuestionDto,
	ImportQuestionByTypeDto,
	ImportFromQuestionDto,
} from './dto';
import { Option } from '../options/option.entity';
import { Answer } from '../answers/answer.entity';
import { ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { ImportQuestionVariableOptionDto } from './dto/import-question-variable-option';

@ApiTags('Questions Routes')
@Controller('questions')
export class QuestionsController {
	constructor(private readonly questionService: QuestionsService) {}
	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all questions' })
	@ApiResponse({ status: 200, description: 'Return all questions.' })
	getQuestions(@Query() queryQuestion: QueryQuestionDto): Promise<Question[]> {
		return this.questionService.getQuestions(queryQuestion);
	}
	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a question by id' })
	@ApiResponse({ status: 200, description: 'Return a question.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	getQuestion(@Param('id') id: number): Promise<Question> {
		return this.questionService.getQuestion(id);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	@UseFilters(DeleteFileException)
	@ApiConsumes('multipart/form-data')
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
	@ApiOperation({ summary: 'Create a question' })
	@ApiResponse({ status: 201, description: 'The question has been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createQuestion(
		@Body() question: CreateQuestionDto,
		@UploadedFile() file: Express.Multer.File,
		@User() user: UserEntity,
	): Promise<Question> {
		if (file) {
			question.photo = 'files/uploads/' + file.filename;
		} else if (question.photo == '') {
			question.photo = null;
		}
		return this.questionService.createQuestion(question, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
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
	@ApiOperation({ summary: 'Update a question' })
	@ApiResponse({ status: 200, description: 'The question has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	updateQuestion(
		@Param('id') id: number,
		@Body() question: UpdateQuestionDto,
		@UploadedFile() file: Express.Multer.File,
		@User() user: UserEntity,
	): Promise<Question> {
		if (file) {
			question.photo = 'files/uploads/' + file.filename;
		}
		return this.questionService.updateQuestion(id, question, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a question' })
	@ApiResponse({ status: 200, description: 'The question has been successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	deleteQuestion(@Param('id') id: number): Promise<void> {
		return this.questionService.deleteQuestion(id);
	}
	@Auth()
	@Get(':id/options')
	@ApiOperation({ summary: 'Get options by question' })
	@ApiResponse({ status: 200, description: 'Return options.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	getOptionByQuestion(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Partial<Option>[]> {
		return this.questionService.getOptionsByQuestion(id, user);
	}
	@Auth()
	@Get(':id/answers')
	@ApiOperation({ summary: 'Get answers by question' })
	@ApiResponse({ status: 200, description: 'Return answers.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	getAnswersByQuestion(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer[]> {
		return this.questionService.getAnswersByQuestion(id, user);
	}
	@Auth()
	@Patch(':id/options/import')
	@ApiOperation({ summary: 'Import options to question' })
	@ApiResponse({ status: 200, description: 'Options have been successfully imported.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	importOptionsToQuestion(
		@Param('id') id: number,
		@Body() ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Option[]> {
		return this.questionService.importOptionsToQuestion(
			id,
			ImportFromQuestionDto,
		);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id/photo/import')
	@ApiOperation({ summary: 'Import photo to question' })
	@ApiResponse({ status: 200, description: 'Photo have been successfully imported.' })
	@ApiResponse({ status: 404, description: 'Question not found.' })
	importPhotoToQuestion(
		@Param('id') id: number,
		@Body() ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Question> {
		return this.questionService.importPhotoToQuestion(
			id,
			ImportFromQuestionDto,
		);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Get('reset/index')
	@ApiOperation({ summary: 'Reset questions index' })
	@ApiResponse({ status: 200, description: 'Questions index reset successfully.' })
	async resetIndex(): Promise<{ message: string }> {
		await this.questionService.resetIndex();
		return { message: 'Question index reset successfully' };
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('import/types')
	@ApiOperation({ summary: 'Import questions by types' })
	@ApiResponse({ status: 201, description: 'Questions have been successfully imported.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	importQuestionsByType(
		@Body() importationData: ImportQuestionByTypeDto,
		@User() user: UserEntity,
	): Promise<Question[]> {
		return this.questionService.importQuestionsByType(importationData, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('import/variable-option')
	@ApiOperation({ summary: 'Import questions by variable option' })
	@ApiResponse({ status: 201, description: 'Questions have been successfully imported.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	importQuestionsByVariableOption(
		@Body() importationData: ImportQuestionVariableOptionDto,
		@User() user: UserEntity,
	): Promise<Question[]> {
		return this.questionService.importQuestionsByVariableOption(
			importationData,
			user,
		);
	}
}
