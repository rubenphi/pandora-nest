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
		]),
	],
	controllers: [GradesController],
	providers: [GradesService],
})
export class GradesModule {}
