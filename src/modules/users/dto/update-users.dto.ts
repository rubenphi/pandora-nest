import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsEmpty,
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
	@IsEmpty()
	@IsEmail()
	readonly email: string;
	@ApiProperty({
		description: 'Unique user code',
	})
	@IsOptional()
	@IsString()
	readonly code: string;
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
