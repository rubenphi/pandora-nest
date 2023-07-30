import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsBoolean, IsOptional, IsInt } from 'class-validator';

export class UpdateCourseDto {
	@ApiProperty({
		description: 'Name of course',
	})
	@IsOptional()
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the course is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
