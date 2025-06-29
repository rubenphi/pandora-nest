import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsInt,
	IsString,
	IsArray,
	ValidateNested,
	IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1️⃣ Opción individual
export class OptionQuestionVariableOptionDto {
	@ApiProperty()
	@IsString()
	sentence: string;

	@ApiProperty()
	@IsBoolean()
	correct: boolean;
	question: import('c:/Users/ruben/GitHub/pandora-nest/src/modules/questions/question.entity').Question;
	institute: import('c:/Users/ruben/GitHub/pandora-nest/src/modules/institutes/institute.entity').Institute;
	identifier: string;
}

// 2️⃣ Pregunta (con varias opciones)
export class ImportQuestionVariableOption {
	@ApiProperty()
	@IsString()
	sentence: string;

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
	lessonId: number;

	@ApiProperty()
	@IsInt()
	points: number;

	@ApiProperty({ type: [ImportQuestionVariableOption] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ImportQuestionVariableOption)
	@IsDefined({ each: true })
	questions: ImportQuestionVariableOption[];
}
