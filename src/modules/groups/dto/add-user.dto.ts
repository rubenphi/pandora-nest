import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddUserToGroupDto {
	@ApiProperty({
		type: Number,
		description: 'User to add Id',
	})
	@IsInt()
	readonly userId: number;
	@IsInt()
	readonly year: number;
	@ApiProperty({
		type: Number,
		description: 'period Id',
	})
	@IsInt()
	readonly periodId: number;
}
