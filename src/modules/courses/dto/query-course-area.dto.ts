import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class QueryCourseAreaDto {
	@ApiProperty({
		description: 'Search area id',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly areaId?: number;
	@ApiProperty({
		description: 'Search area if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly active?: boolean;
}
