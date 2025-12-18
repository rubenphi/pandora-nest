import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsEnum } from 'class-validator';
import { CreateLessonDto } from '../../lessons/dto/create-lesson.dto';
import { LessonType } from '../../lessons/lesson.entity';

export class CreateReinforcementLessonDto extends CreateLessonDto {
	@ApiProperty({
		description: 'List of student IDs to assign to this reinforcement',
		type: [Number],
	})
	@IsArray()
	@IsInt({ each: true })
	readonly studentIds: number[];

	@ApiProperty({
		description: 'Teacher ID creating the reinforcement',
	})
	@IsInt()
	readonly teacherId: number;

	@ApiPropertyOptional({
		description: 'Type of the special lesson',
		enum: LessonType,
		default: LessonType.REINFORCEMENT,
	})
	@IsOptional()
	@IsEnum(LessonType)
	readonly lessonType?: LessonType;
}
