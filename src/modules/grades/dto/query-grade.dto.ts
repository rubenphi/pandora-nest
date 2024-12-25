import { ApiProperty } from '@nestjs/swagger';

import { IsInt, IsOptional } from 'class-validator';

export class QueryGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to search',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly userId: number;
	@ApiProperty({
		type: Number,
		description: 'Lesson to search',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		type: Number,
		description: 'Period to search',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly periodId: number;

	//two numbers to search grades in a range

	@ApiProperty({
		type: Number,
		description: 'Grade min',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly gradeMin: number;

	@ApiProperty({
		type: Number,
		description: 'Grade max',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly gradeMax: number;

	//institute id to search grades in a specific institute
	@ApiProperty({
		type: Number,
		description: 'Institute to search',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
}
