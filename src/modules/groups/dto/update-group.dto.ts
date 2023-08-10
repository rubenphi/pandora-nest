import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
	@Type(() => Number)
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Year of the group',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;
	@ApiProperty({
		description: 'Institute id of group',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Period id of group',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly periodId: number;
	@ApiProperty({
		description: 'Indicates if the group is exist or was "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
	@ApiProperty({
		description: 'Indicates if the group is active or inactive',
	})
	@IsOptional()
	@IsBoolean()
	readonly active: boolean;
}
