import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class QueryPeriodDto {
	@ApiProperty({
		description: 'Search period using a identifier',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Institute id of period',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Search period if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		if (value === undefined || value === null || value === '') return undefined;
		return [true, 'enabled', 'true', 1, '1'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist: boolean;
}
