import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { Answer } from './answer.entity';
import { Option } from 'src/modules/options/option.entity';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Group } from 'src/modules/groups/group.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { UsersModule } from '../users/users.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Answer,
			Option,
			Lesson,
			Group,
			Question,
			Institute,
			User,
			Quiz,
		]),
		UsersModule,
		QuizzesModule,
		LessonsModule,
	],
	providers: [AnswersService],
	controllers: [AnswersController],
})
export class AnswersModule {}
