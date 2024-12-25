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

export class QueryUserGroupsDto {
	@ApiProperty({
		description: 'Period of assignament',
		required: false,
	})
	@ApiProperty({
		description: 'Search the assignament if exist or not',
		required: false,
	})
	@ApiProperty({
		description: 'Search the assignament if is active or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly active?: boolean;
}
