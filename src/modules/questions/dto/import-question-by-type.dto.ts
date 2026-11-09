import { ApiProperty } from '@nestjs/swagger';
import {
	IsInt,
	IsString,
	IsArray,
	ValidateNested,
	IsDefined,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionOfTypesDto {
	@ApiProperty()
	@IsString()
	type: string;

	@ApiProperty()
	@IsString()
	sentence: string;

	@ApiProperty({
		description:
			'Path of the already uploaded image, as returned by ' +
			'POST /files/upload-multiple (e.g. "files/uploads/abc123.png").',
		required: false,
	})
	@IsOptional()
	@IsString()
	photo?: string;
}

export class ImportQuestionByTypeDto {
	@ApiProperty()
	@IsInt()
	quizId: number;

	@ApiProperty()
	@IsInt()
	points: number;

	@ApiProperty({ type: [QuestionOfTypesDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => QuestionOfTypesDto)
	@IsDefined({ each: true }) // ← opcional, pero ayuda a validar contenido
	questions: QuestionOfTypesDto[];

	@ApiProperty()
	@IsArray()
	@IsString({ each: true })
	types: string[];
}
