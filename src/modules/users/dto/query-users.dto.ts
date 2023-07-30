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

export class QueryUserDto {
	@ApiProperty({
		description: 'Search user user by name',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Search user user by last name',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly lastName?: string;
	@ApiProperty({
		description: 'Search user user by email',
		required: false,
	})
	@IsOptional()
	@IsEmail()
	readonly email?: string;
	@ApiProperty({
		description: 'Search user user by code',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly code?: string;
	@ApiProperty({
		description: 'Institute id of user',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
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
