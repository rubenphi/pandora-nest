import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsInt,
	IsString,
	IsArray,
	ValidateNested,
	IsDefined,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Question } from '../question.entity';
import { Institute } from 'src/modules/institutes/institute.entity';

// 1️⃣ Opción individual
export class OptionQuestionVariableOptionDto {
	@ApiProperty()
	@IsString()
	sentence: string;

	@ApiProperty()
	@IsBoolean()
	correct: boolean;
	question: Question;
	institute: Institute;
	identifier: string;
}

// 2️⃣ Pregunta (con varias opciones)
export class ImportQuestionVariableOption {
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

	@ApiProperty({ type: [OptionQuestionVariableOptionDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => OptionQuestionVariableOptionDto)
	@IsDefined({ each: true })
	options: OptionQuestionVariableOptionDto[];
}

// 3️⃣ Lote de preguntas que llegarán al endpoint
export class ImportQuestionVariableOptionDto {
	@ApiProperty()
	@IsInt()
	quizId: number;

	@ApiProperty()
	@IsInt()
	points: number;

	@ApiProperty()
	@IsBoolean()
	shuffleOptions: boolean;

	@ApiProperty({ type: [ImportQuestionVariableOption] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ImportQuestionVariableOption)
	@IsDefined({ each: true })
	questions: ImportQuestionVariableOption[];
}
