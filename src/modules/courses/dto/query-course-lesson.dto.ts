import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class QueryCourseLesson {
	@ApiProperty({
		description: 'Search Lesson area id',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly areaId?: number;
}
