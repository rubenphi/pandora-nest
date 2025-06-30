import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './question.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Option } from '../options/option.entity';
import { Institute } from '../institutes/institute.entity';
import { Quiz } from '../quizzes/quiz.entity';
@Module({
	imports: [
		TypeOrmModule.forFeature([Question, Quiz, Lesson, Option, Institute]),
	],
	providers: [QuestionsService],
	controllers: [QuestionsController],
})
export class QuestionsModule {}
