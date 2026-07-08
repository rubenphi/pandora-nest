import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ─── Survey Template DTOs ───────────────────────────────────────────────

export class CreateSurveyTemplateDto {
	@ApiProperty({ example: 'Encuesta a Padres' })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({ example: 'parent-survey' })
	@IsString()
	@IsNotEmpty()
	slug: string;

	@ApiProperty({
		example: {
			sections: [
				{
					id: 'seccion1',
					title: 'Preguntas 1 a 14',
					type: 'likert',
					options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
					count: 14,
				},
			],
		},
	})
	@IsObject()
	questionsConfig: Record<string, any>;
}

export class UpdateSurveyTemplateDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	name?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	slug?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsObject()
	questionsConfig?: Record<string, any>;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

export class QuerySurveyTemplateDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	slug?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}

// ─── Survey Response DTOs ───────────────────────────────────────────────

export class CreateSurveyResponseDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	@IsNotEmpty()
	templateId: number;

	@ApiProperty({ example: '0001' })
	@IsString()
	@IsNotEmpty()
	code: string;

	@ApiProperty({
		example: {
			seccion1: [
				{ question: 'Q1', answer: 'Siempre' },
			],
			seccion2: [],
			multiselect: ['Tablero', 'Computadores'],
		},
	})
	@IsObject()
	answers: Record<string, any>;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	imageUrl?: string;

	@ApiProperty({ required: false, example: 'parent' })
	@IsOptional()
	@IsString()
	respondent?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	sessionId?: number;
}

export class QuerySurveyResponseDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	templateId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	respondent?: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	sessionId?: number;
}

// ─── Survey Session DTOs ────────────────────────────────────────────────

export class CreateSurveySessionDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	@IsNotEmpty()
	templateId: number;

	@ApiProperty({ example: 2025 })
	@IsNumber()
	@IsNotEmpty()
	year: number;

	@ApiProperty({ example: 'Primer Semestre' })
	@IsString()
	@IsNotEmpty()
	label: string;
}

export class QuerySurveySessionDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	templateId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	year?: number;
}
