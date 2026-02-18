import { IsEnum, IsNotEmpty, IsNumber, IsString, ArrayMinSize, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePollOptionDto {
	@ApiProperty({ example: 'Opción A' })
	@IsString()
	@IsNotEmpty()
	text: string;
}

export class CreatePollDto {
	@ApiProperty({ example: 'Encuesta del día' })
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({ example: '¿Cuál es tu color favorito?' })
	@IsString()
	@IsNotEmpty()
	question: string;

	@ApiProperty({ enum: ['group', 'individual'], default: 'group' })
	@IsEnum(['group', 'individual'])
	mode: 'group' | 'individual';

	@ApiProperty({ example: 1 })
	@IsNumber()
	courseId: number;

	@ApiProperty({ example: 1 })
	@IsNumber()
	periodId: number;

	@ApiProperty({ example: 2024 })
	@IsNumber()
	year: number;

	@ApiProperty({ type: [CreatePollOptionDto], minItems: 2 })
	@ArrayMinSize(2)
	@ValidateNested({ each: true })
	@Type(() => CreatePollOptionDto)
	options: CreatePollOptionDto[];
}

export class CastVoteDto {
	@ApiProperty({ example: 1 })
	@IsNumber()
	optionId: number;
}

export class QueryPollDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	courseId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	periodId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	year?: number;
}
