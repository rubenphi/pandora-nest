import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsBoolean,
	IsEmail,
	IsOptional,
	ValidateIf,
	IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		description: 'Name of user',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Last name of user',
	})
	@IsString()
	readonly lastName: string;
	@ApiProperty({
		description: 'Email of user',
	})
	@IsNotEmpty()
	@ValidateIf((o) => o.email != '')
	@IsEmail()
	readonly email: string;
	@ApiProperty({
		description: 'Unique user code',
	})
	@IsString()
	readonly code: string;
	@ApiProperty({
		description: 'Telephone number of user',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly telephone?: string;
	@ApiProperty({
		description: 'Institute invitation of user',
	})
	@IsOptional()
	readonly instituteInvitation: string;
	@ApiProperty({
		description: 'Password of user',
	})
	@IsString()
	readonly password: string;
	@ApiProperty({
		description: 'Indicates if the question is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
