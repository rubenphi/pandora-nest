import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateCourseDto {
	@ApiProperty({
		description: 'Name of course',
	})
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the course is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
