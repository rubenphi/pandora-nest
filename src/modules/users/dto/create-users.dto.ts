import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	ValidateIf,
} from 'class-validator';

export class CreateUserDto {
	@IsString()
	readonly name: string;
	@IsString()
	readonly lastName: string;
	@IsOptional()
	@ValidateIf((o) => o.email != '')
	@IsEmail()
	readonly email: string;
	@IsString()
	readonly code: string;
	@IsBoolean()
	readonly exist: boolean;
	@IsString()
	readonly password: string;
}
