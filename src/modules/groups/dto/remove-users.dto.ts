import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class RemoveUserFromGroupDto {
	@ApiProperty({
		type: Number,
		description: 'User ID to remove from the group',
	})
	@IsInt()
	readonly userIdToRemove: number;
}
