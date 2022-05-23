import { IsString, IsBoolean } from 'class-validator';

export class CreateUserDto {
	@IsString()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
