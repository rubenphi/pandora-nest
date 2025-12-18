import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LessonType } from '../../lessons/lesson.entity';

export class FindReinforcementByContextDto {
	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	readonly courseId: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	readonly areaId: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	readonly periodId: number;

	@ApiProperty()
	@Type(() => Number)
	@IsInt()
	readonly year: number;

	@ApiPropertyOptional({
		description: 'Type of the special lesson to filter by',
		enum: LessonType,
	})
	@IsOptional()
	@IsEnum(LessonType)
	readonly lessonType?: LessonType;
}
