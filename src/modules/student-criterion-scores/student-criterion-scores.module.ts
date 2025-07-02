import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCriterionScore } from './student-criterion-score.entity';
import { StudentCriterionScoresController } from './student-criterion-scores.controller';
import { StudentCriterionScoresService } from './student-criterion-scores.service';
import { User } from 'src/modules/users/user.entity';
import { Activity } from 'src/modules/activities/activity.entity';
import { Criterion } from 'src/modules/criteria/criterion.entity';
import { Institute } from 'src/modules/institutes/institute.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			StudentCriterionScore,
			User,
			Activity,
			Criterion,
			Institute,
		]),
	],
	controllers: [StudentCriterionScoresController],
	providers: [StudentCriterionScoresService],
	exports: [StudentCriterionScoresService],
})
export class StudentCriterionScoresModule {}
