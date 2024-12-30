import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean } from 'class-validator';

export class UpdateUserFromGroupDto {
	@ApiProperty({
		type: Number,
		description: 'User ID to remove from the group',
	})
	@IsInt()
	readonly userIdToRemove: number;

	@ApiProperty({
		type: Boolean,
		description: 'If the user is active in the group',
	})
	@IsBoolean()
	readonly active: boolean;
}
