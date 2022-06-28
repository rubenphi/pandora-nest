import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class QueryCourseDto {
	@ApiProperty({
		description: 'Search curse using name',
		required: false
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Institute id of user',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Search course if exist or not',
		required: false
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
