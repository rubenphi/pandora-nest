import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsEmpty,
} from 'class-validator';

export class UpdateUserDto {
	@IsString()
	readonly name: string;
	@IsString()
	readonly lastName: string;
	@IsOptional()
	@IsEmpty()
	@IsEmail()
	readonly email: string;
	@IsString()
	readonly code: string;
	@IsBoolean()
	readonly exist: boolean;
	@IsString()
	readonly password: string;
}
