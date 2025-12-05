import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';

import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';
import { Question } from '../questions/question.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { Period } from '../periods/period.entity';
import { Answer } from '../answers/answer.entity'; // New import
import { Option } from '../options/option.entity'; // New import
import { ActivitiesModule } from '../activities/activities.module';
import { MaterialsModule } from '../materials/materials.module';
import { Grade } from '../grades/grade.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Quiz,
			Lesson,
			Institute,
			Question,
			Course,
			Area,
			Period,
			Answer, // New entity
			Option, // New entity
			Grade,
		]),
		ActivitiesModule,
		MaterialsModule,
	],
	controllers: [QuizzesController],
	providers: [QuizzesService],
	exports: [QuizzesService],
})
export class QuizzesModule {}
