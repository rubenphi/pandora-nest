import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './grade.entity';
import { User } from '../users/user.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Activity } from '../activities/activity.entity';
import { Lesson } from '../lessons/lesson.entity';
import { ActivityEvidence } from '../activity-evidences/activity-evidence.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';
import { Answer } from '../answers/answer.entity';
import { UserToCourse } from '../users/userToCourse.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Grade,
			User,
			Quiz,
			Activity,
			Lesson,
			Period,
			Institute,
			ActivityEvidence,
			StudentCriterionScore,
			Answer,
			UserToCourse,
		]),
	],
	controllers: [GradesController],
	providers: [GradesService],
	exports: [GradesService],
})
export class GradesModule {}
