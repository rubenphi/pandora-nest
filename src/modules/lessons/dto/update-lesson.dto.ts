import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateLessonDto {
	@ApiProperty({
		description: 'Topic of lesson',
	})
	@IsOptional()
	@IsString()
	readonly topic: string;
	@ApiProperty({
		description: 'Date of lesson',
	})
	@IsOptional()
	@IsDateString()
	readonly date: Date;
	@ApiProperty({
		description: 'Course id of lesson',
	})
	@IsOptional()
	@IsInt()
	readonly courseId: number;
	@ApiProperty({
		description: 'Area id of lesson',
	})
	@IsOptional()
	@IsInt()
	readonly areaId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the lesson is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
