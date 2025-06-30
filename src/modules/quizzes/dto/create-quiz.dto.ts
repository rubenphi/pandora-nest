import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';

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
}
