import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
	IsString,
	IsInt,
	IsBoolean,
	IsDateString,
	IsOptional,
} from 'class-validator';

export class QueryLessonDto {
	@ApiProperty({
		description: 'Search lesson using topic',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly topic?: string;
	@ApiProperty({
		description: 'Search lesson using date',
		required: false,
	})
	@IsOptional()
	@Type(() => Date)
	@IsDateString()
	readonly date?: Date;
	@ApiProperty({
		description: 'Search lesson using curse id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;
	@ApiProperty({
		description: 'Search lesson using period id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly periodId?: number;
	@ApiProperty({
		description: 'Year of lesson',
		required: false,
	})
	@Type(() => Number)
	@IsInt()
	@IsOptional()
	readonly year?: number;
	@ApiProperty({
		description: 'Search lesson using area id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly areaId?: number;
	@ApiProperty({
		description: 'Institute id of lesson',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId?: number;
	@ApiProperty({
		description: 'Search group if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
