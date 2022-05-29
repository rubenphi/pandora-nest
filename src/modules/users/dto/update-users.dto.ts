import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	IsEmpty,
} from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	readonly name: string;
	@IsOptional()
	@IsString()
	readonly lastName: string;
	@IsOptional()
	@IsEmpty()
	@IsEmail()
	readonly email: string;
	@IsString()
	readonly code: string;
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
	@IsOptional()
	@IsString()
	readonly password: string;
}
