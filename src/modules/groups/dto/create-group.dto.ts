import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateGroupDto {
	@ApiProperty({
		description: 'Group´s name',
	})
	@IsString()
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
