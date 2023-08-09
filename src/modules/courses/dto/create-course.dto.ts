import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateCourseDto {
	@ApiProperty({
		description: 'Name of course',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of course',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the course is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
