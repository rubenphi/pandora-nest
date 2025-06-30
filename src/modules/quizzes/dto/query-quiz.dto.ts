import { ApiProperty } from '@nestjs/swagger';
import {
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { QuizType } from './create-quiz.dto';

export class QueryQuizDto {
	@ApiProperty({
		description: 'Search quiz using a word or phrase in the title',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly title?: string;

	@ApiProperty({
		description: 'Search quiz using its type (group or individual)',
		enum: QuizType,
		required: false,
	})
	@IsOptional()
	@IsEnum(QuizType)
	readonly quizType?: QuizType;

	@ApiProperty({
		description: 'Search quiz using the lesson ID',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId?: number;

	@ApiProperty({
		description: 'Search quiz using the institute ID',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId?: number;

	@ApiProperty({
		description: 'Search quiz using the course ID of the associated lesson',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;

	@ApiProperty({
		description: 'Search quiz using the period ID of the associated lesson',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly periodId?: number;

	@ApiProperty({
		description: 'Search quiz using the year of the associated lesson',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year?: number;

	@ApiProperty({
		description: 'Search quiz by existence status of the associated lesson',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
