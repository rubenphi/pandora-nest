import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsInt,
} from 'class-validator';

export class UpdateUserDto {
	@ApiProperty({
		description: 'Name of user',
	})
	@IsOptional()
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Last name of user',
	})
	@IsOptional()
	@IsString()
	readonly lastName: string;
	@ApiProperty({
		description: 'Email of user',
	})
	@IsOptional()
	@IsEmail()
	readonly email: string;
	@ApiProperty({
		description: 'Unique user code',
	})
	@IsOptional()
	@IsString()
	readonly code: string;
	@ApiProperty({
		description: 'Rol of user',
	})
	@IsOptional()
	@IsString()
	readonly rol: string;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Password of user',
	})
	@IsOptional()
	@IsString()
	readonly password: string;
	@ApiProperty({
		description: 'Indicates if the question is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
