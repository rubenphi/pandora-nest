import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import { IsInt, IsOptional } from 'class-validator';

export class QueryGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly userId: number;

	@ApiProperty({
		type: Number,
		description: 'year to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;

	@ApiProperty({
		type: Number,
		description: 'course to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId: number;

	@ApiProperty({
		type: Number,
		description: 'Area to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly areaId: number;
	@ApiProperty({
		type: Number,
		description: 'Lesson to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		type: Number,
		description: 'Period to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly periodId: number;
	@ApiProperty({
		type: Number,
		description: 'Grade min',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly gradeMin: number;

	@ApiProperty({
		type: Number,
		description: 'Grade max',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly gradeMax: number;

	//institute id to search grades in a specific institute
	@ApiProperty({
		type: Number,
		description: 'Institute to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
}
