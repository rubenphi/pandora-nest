import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt } from 'class-validator';

export class CreatePeriodDto {
	@ApiProperty({
		description: 'Name of period',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the period is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
