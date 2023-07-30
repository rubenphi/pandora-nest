import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt } from 'class-validator';

export class QueryUsersOfCourseDto {
	@ApiProperty({
		description: 'Year',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;
}
