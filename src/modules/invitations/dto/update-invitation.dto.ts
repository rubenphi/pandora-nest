import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsISO8601, IsInt, IsString } from 'class-validator';

export class UpdateInvitationDto  {
	@ApiProperty({
		description: 'Expiration date of invitation',
	})
	@IsISO8601()
	readonly expirationDate: string;
    @ApiProperty({
		description: 'Invitation code',
	})
	@IsString()
	readonly code: string;
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

