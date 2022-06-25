import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdatePeriodDto {
	@ApiProperty({
		description: 'Name of period',
	})
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the period is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
