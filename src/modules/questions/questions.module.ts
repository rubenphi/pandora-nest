import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './question.entity';
import { Lesson } from '../lessons/lesson.entity';
@Module({
	imports: [TypeOrmModule.forFeature([Question, Lesson])],
	providers: [QuestionsService],
	controllers: [QuestionsController],
})
export class QuestionsModule {}
