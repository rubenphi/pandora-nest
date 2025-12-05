import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reinforcement } from './reinforcement.entity';
import { ReinforcementService } from './reinforcement.service';
import { ReinforcementController } from './reinforcement.controller';
import { User } from '../users/user.entity';
import { Area } from '../areas/area.entity';
import { Period } from '../periods/period.entity';
import { Course } from '../courses/course.entity';


import { ReinforcementGradableItem } from './reinforcement-gradable-item.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Activity } from '../activities/activity.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Reinforcement,
			User,
			Area,
			Period,
			Course,
			ReinforcementGradableItem,
			Quiz,
			Activity,
			Lesson,
			Institute,
		]),
	],


	providers: [ReinforcementService],
	controllers: [ReinforcementController],
	exports: [ReinforcementService],
})
export class ReinforcementModule {}
