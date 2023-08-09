import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsString,
	IsDateString,
	IsInt,
	IsBoolean,
	IsOptional,
} from 'class-validator';

export class UpdateLessonDto {
	@ApiProperty({
		description: 'Topic of lesson',
	})
	@IsOptional()
	@IsString()
	readonly topic: string;
	@ApiProperty({
		description: 'Date of lesson',
	})
	@IsOptional()
	@IsDateString()
	readonly date: Date;
	@ApiProperty({
		description: 'Course id of lesson',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Area id of lesson',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly areaId: number;
	@ApiProperty({
		description: 'Institute id of lesson',
	})
	@ApiProperty({
		description: 'Year of lesson',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the lesson is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
