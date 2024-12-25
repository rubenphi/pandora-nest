import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsISO8601, IsString } from 'class-validator';

export class CreateInvitationDto {
	@ApiProperty({
		description: 'Expiration date of invitation',
	})
	@IsISO8601()
	readonly expirationDate: string;

	@ApiProperty({
		description: 'Institute id of invitation',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the invitation is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
	@ApiProperty({
		description: 'Indicates if the invitation was expired',
	})
	@IsBoolean()
	readonly active: boolean;
}
