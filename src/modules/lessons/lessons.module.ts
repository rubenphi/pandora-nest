import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { Institute } from '../institutes/institute.entity';
import { Period } from '../periods/period.entity';
import { ActivitiesModule } from '../activities/activities.module';
import { QuizzesModule } from '../quizzes/quizzes.module';
import { MaterialsModule } from '../materials/materials.module';
import { UsersModule } from '../users/users.module';
import { LessonItemsModule } from '../lesson-items/lesson-items.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Lesson, Course, Area, Institute, Period]),
		ActivitiesModule,
		QuizzesModule,
		MaterialsModule,
		UsersModule,
		LessonItemsModule,
	],
	providers: [LessonsService],
	controllers: [LessonsController],
	exports: [LessonsService, TypeOrmModule.forFeature([Lesson])],
})
export class LessonsModule {}
