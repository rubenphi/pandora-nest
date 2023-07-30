import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class RemoveUserFromCourseDto {
	@ApiProperty({
		type: Number,
		description: 'User IDs to remove from the group',
	})
	@IsInt()
	readonly userIdToRemove: number;

	@ApiProperty({
		description: 'Year',
	})
	@IsInt()
	readonly year: number;
}
