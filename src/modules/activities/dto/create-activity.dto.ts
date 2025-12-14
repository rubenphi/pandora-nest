import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	title: string;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsString()
	instructions?: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	lessonId: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	instituteId?: number;

	@IsOptional()
	@IsEnum(['knowledge', 'execution', 'behavior'])
	classification: 'knowledge' | 'execution' | 'behavior';
}
