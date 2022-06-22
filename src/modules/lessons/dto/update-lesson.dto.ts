import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
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
		description: 'Area id of lesson',
	})
	@IsInt()
	readonly areaId: number;
	@ApiProperty({
		description: 'Indicates if the lesson is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
