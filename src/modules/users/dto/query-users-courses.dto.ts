import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
	IsString,
	IsEmail,
	IsBoolean,
	IsOptional,
	ValidateIf,
	IsInt,
} from 'class-validator';

export class QueryUserCoursesDto {
	@ApiProperty({
		description: 'Year of assignament',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;

	@ApiProperty({
		description: 'Search the user if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
