import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePeriodDto {
	@IsNotEmpty()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
