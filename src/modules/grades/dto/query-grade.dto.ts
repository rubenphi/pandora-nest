import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';
import { GRADABLE_ENTITIES } from '../grade.entity';

export class QueryGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly userId?: number;

	@ApiProperty({
		type: Number,
		description: 'ID of the gradable item to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly gradableId?: number;

	@ApiProperty({
		type: String,
		description: 'Type of the gradable item to search',
		required: false,
		enum: GRADABLE_ENTITIES,
	})
	@IsOptional()
	@IsString()
	@IsIn(GRADABLE_ENTITIES)
	readonly gradableType?: string;

	@ApiProperty({
		type: Number,
		description: 'Course to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;

	@ApiProperty({
		type: Number,
		description: 'Area to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly areaId?: number;

	@ApiProperty({
		type: Number,
		description: 'Year to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year?: number;

	@ApiProperty({
		type: Number,
		description: 'Period to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly periodId?: number;

	@ApiProperty({
		type: Number,
		description: 'Grade min',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly gradeMin?: number;

	@ApiProperty({
		type: Number,
		description: 'Grade max',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly gradeMax?: number;

	@ApiProperty({
		type: Number,
		description: 'Institute to search',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId?: number;
}
