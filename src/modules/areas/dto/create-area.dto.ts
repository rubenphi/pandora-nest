import { IsString, IsBoolean } from 'class-validator';

export class CreateAreaDto {
	@IsString()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
