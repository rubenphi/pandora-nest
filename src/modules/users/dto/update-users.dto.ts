import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateUserDto {
	@IsNotEmpty()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
