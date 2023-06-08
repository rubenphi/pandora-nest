import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateLessonDto {
	@ApiProperty({
		description: 'Topic of lesson',
	})
	@IsString()
	readonly topic: string;
	@ApiProperty({
		description: 'Date of lesson',
	})
	@IsDateString()
	readonly date: Date;
	@ApiProperty({
		description: 'Course id of lesson',
	})
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Year of lesson',
	})
	@IsInt()
	readonly year: number;
	@ApiProperty({
		description: 'Area id of lesson',
	})
	@IsInt()
	readonly areaId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the lesson is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
