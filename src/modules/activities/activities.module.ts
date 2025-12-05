import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';
import { Grade } from '../grades/grade.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Activity,
			Lesson,
			Institute,
			Grade,
			StudentCriterionScore,
		]),
	],
	controllers: [ActivitiesController],
	providers: [ActivitiesService],
	exports: [ActivitiesService],
})
export class ActivitiesModule {}
