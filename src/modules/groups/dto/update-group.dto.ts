import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class UpdateGroupDto {
	@ApiProperty({
		description: 'Group´s name',
	})
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Course id',
	})
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Indicates if the group is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
