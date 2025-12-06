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
		description: 'Institute id of group',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Period id of user',
	})
	@IsInt()
	readonly periodId: number;
	@ApiProperty({
		description: 'Year of the group',
	})
	@IsInt()
	readonly year: number;
	@ApiProperty({
		description: 'Indicates if the group exist or was "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
	@ApiProperty({
		description: 'Indicates if the group is active or inactive',
	})
	@IsBoolean()
	readonly active: boolean;
}
