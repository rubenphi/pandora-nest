import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { QuizScan } from './quiz-scan.entity';
import { QuizzesController } from './quizzes.controller';
import { QuizzesService } from './quizzes.service';
import { FilesModule } from '../files/files.module';

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
import { CourseAccessModule } from 'src/common/authorization/course-access.module';

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
			QuizScan,
		]),
		FilesModule,
		ActivitiesModule,
		MaterialsModule,
		CourseAccessModule,
	],
	controllers: [QuizzesController],
	providers: [QuizzesService],
	exports: [QuizzesService],
})
export class QuizzesModule {}
