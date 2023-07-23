import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddUserToGroupDto {
	@ApiProperty({
		type: [Number],
		description: 'Users to add Id',
	})
	@IsInt({ each: true })
	readonly usersId: number[];
	@IsInt()
	readonly periodId: number;
}
