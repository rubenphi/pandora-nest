import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class UpdatePeriodDto {
	@ApiProperty({
		description: 'Name of period',
	})
	@IsOptional()
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the period is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
