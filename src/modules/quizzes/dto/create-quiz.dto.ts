import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EvaluationType } from './evaluation-type.enum';

export enum QuizType {
	GROUP = 'group',
	INDIVIDUAL = 'individual',
}

export class CreateQuizDto {
	@ApiProperty({
		description: 'Title of the quiz',
	})
	@IsString()
	readonly title: string;

	@ApiProperty({
		description: 'Type of the quiz (group or individual)',
		enum: QuizType,
		default: QuizType.GROUP,
	})
	@IsEnum(QuizType)
	readonly quizType: QuizType;

	@ApiProperty({
		description: 'Lesson ID to which the quiz belongs',
	})
	@IsInt()
	readonly lessonId: number;

	@ApiProperty({
		description: 'Institute ID to which the quiz belongs',
	})
	@IsInt()
	readonly instituteId: number;

	@IsOptional()
	@IsEnum(['knowledge', 'execution', 'behavior'])
	classification: 'knowledge' | 'execution' | 'behavior';

	@ApiProperty({
		description: 'Type of evaluation for the quiz',
		enum: EvaluationType,
		default: EvaluationType.RELATIVE,
		required: false,
	})
	@IsOptional()
	@IsEnum(EvaluationType)
	readonly evaluationType?: EvaluationType;
}
