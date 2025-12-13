import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, IsBoolean } from 'class-validator';

export class QueryUsersOfCourseDto {
	@ApiProperty({
		description: 'Year',
		required: true,
	})
	@Type(() => Number)
	@IsInt()
	readonly year: number;

	@ApiProperty({
		description: 'Filter by active status',
		required: false,
	})
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	readonly active?: boolean;
}
