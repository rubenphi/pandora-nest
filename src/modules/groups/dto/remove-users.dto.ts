import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class RemoveUserFromGroupDto {
	@ApiProperty({
		type: [Number],
		description: 'User IDs to remove from the group',
	})
	@IsInt({ each: true })
	readonly usersIdToRemove: number[];

	@ApiProperty({
		description: 'Period ID of the group',
	})
	@IsInt()
	readonly periodId: number;
}
