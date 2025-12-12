import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { EvaluationType } from './evaluation-type.enum';
import { QuizType } from './create-quiz.dto';

export class UpdateQuizDto {
	@ApiProperty({
		description: 'Title of the quiz',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly title?: string;

	@ApiProperty({
		description: 'Type of the quiz (group or individual)',
		enum: QuizType,
		required: false,
	})
	@IsOptional()
	@IsEnum(QuizType)
	readonly quizType?: QuizType;

	@ApiProperty({
		description: 'Lesson ID to which the quiz belongs',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly lessonId?: number;

	@ApiProperty({
		description: 'Institute ID to which the quiz belongs',
		required: false,
	})
	@IsOptional()
	@IsOptional()
	@IsInt()
	readonly instituteId?: number;

	@ApiProperty({
		description: 'Classification of the quiz (knowledge, execution, behavior)',
		enum: ['knowledge', 'execution', 'behavior'],
		required: false,
	})
	@IsOptional()
	@IsEnum(['knowledge', 'execution', 'behavior'])
	readonly classification?: 'knowledge' | 'execution' | 'behavior';

	@ApiProperty({
		description: 'Type of evaluation for the quiz',
		enum: EvaluationType,
		required: false,
	})
	@IsOptional()
	@IsEnum(EvaluationType)
	readonly evaluationType?: EvaluationType;
}
