import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsArray,
	ArrayNotEmpty,
	ValidateNested,
	IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ImportQuestionsMixDto {
	@ApiProperty({
		description:
			'ID of the destination lesson where the questions will be imported',
		example: 42,
	})
	@IsInt()
	readonly toLessonId: number;

	@ApiProperty({
		description: 'Array of questions to import',
		example: [{ id: 1, title: 'Pregunta A' }],
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type(() => QuestionImportItemDto)
	readonly questions: QuestionImportItemDto[];
}

export class QuestionImportItemDto {
	@ApiProperty({ description: 'ID of the question to import' })
	@IsInt()
	id: number;

	@ApiProperty({ description: 'New title for the imported question' })
	@IsString()
	title: string;
}
