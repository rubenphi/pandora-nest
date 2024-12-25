import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsString } from 'class-validator';

export class UserToGroupDto {
	@ApiProperty({
		description: 'Group id',
	})
	@IsInt()
	readonly groupId: number;

	@ApiProperty({
		description: 'User id',
	})
	@IsInt()
	readonly userId: number;
	@ApiProperty({
		description: 'Autorization code',
	})
	@IsString()
	readonly code: string;

	@ApiProperty({
		description: 'Indicates if the user is active or "deleted"',
	})
	@IsBoolean()
	readonly active: boolean;
}
