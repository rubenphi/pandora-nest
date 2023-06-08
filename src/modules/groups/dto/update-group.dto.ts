import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsString, IsOptional } from 'class-validator';

export class UpdateGroupDto {
	@ApiProperty({
		description: 'Group´s name',
	})
	@IsOptional()
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Course id',
	})
	@IsOptional()
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Year of the group',
	})
	@IsOptional()
	@IsInt()
	readonly year: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the group is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
