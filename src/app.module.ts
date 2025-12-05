import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { FilesModule } from './modules/files/files.module';
import { OptionsModule } from './modules/options/options.module';
import { AnswersModule } from './modules/answers/answers.module';
import { AreasModule } from './modules/areas/areas.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { Configuration } from './config/config.keys';
import { UsersModule } from './modules/users/users.module';
import { PeriodsModule } from './modules/periods/periods.module';
import { AuthModule } from './modules/auth/auth.module';
import { InstitutesModule } from './modules/institutes/institutes.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { GradesModule } from './modules/grades/grades.module';
import { QuizzesModule } from './modules/quizzes/quizzes.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { CriteriaModule } from './modules/criteria/criteria.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { LessonItemsModule } from './modules/lesson-items/lesson-items.module';
import { StudentCriterionScoresModule } from './modules/student-criterion-scores/student-criterion-scores.module';
import { ReinforcementModule } from './modules/reinforcement/reinforcement.module';


import * as dotenv from 'dotenv';

dotenv.config();

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: process.env.DB_TYPE as any,
			host: process.env.DB_HOST,
			database: process.env.DB_NAME,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			dropSchema: false,
			synchronize: true,
			entities: ['dist/**/**/*.entity{.js,.ts}'],
			migrations: ['dist/database/migrations/*{.js,.ts}'],
		}),
		CoursesModule,
		GroupsModule,
		LessonsModule,
		QuestionsModule,
		FilesModule,
		OptionsModule,
		AnswersModule,
		AreasModule,
		ConfigModule,
		UsersModule,
		PeriodsModule,
		AuthModule,
		InstitutesModule,
		InvitationsModule,
		GradesModule,
		QuizzesModule,
		ActivitiesModule,
		CriteriaModule,
		MaterialsModule,
		LessonItemsModule,
		StudentCriterionScoresModule,
		ReinforcementModule,
	],

})
export class AppModule {
	static port: number | string;
	constructor(private readonly _configService: ConfigService) {
		AppModule.port = this._configService.get(Configuration.PORT);
	}
}
