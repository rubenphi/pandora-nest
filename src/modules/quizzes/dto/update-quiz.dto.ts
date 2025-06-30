import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
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
  @IsInt()
  readonly instituteId?: number;
}
