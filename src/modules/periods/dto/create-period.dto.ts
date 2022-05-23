import { IsString, IsBoolean } from 'class-validator';

export class CreatePeriodDto {
	@IsString()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
