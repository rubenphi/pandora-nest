import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join, isAbsolute } from 'path';
import { existsSync, mkdirSync, statSync } from 'fs';

import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { FilesModule } from './modules/files/files.module';
import { OptionsModule } from './modules/options/options.module';
import { AnswersModule } from './modules/answers/answers.module';
import { AreasModule } from './modules/areas/areas.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { PollsModule } from './modules/polls/polls.module';
import { SurveysModule } from './modules/surveys/surveys.module';
import { ActivityEvidencesModule } from './modules/activity-evidences/activity-evidences.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { entities } from './database/entities';
import { getDataDir, isValidSqlite } from './common/utils/paths.util';
import { AppInitializerService } from './database/app-initializer.service';
import { User } from './modules/users/user.entity';
import { Institute } from './modules/institutes/institute.entity';
import { SurveyTemplate } from './modules/surveys/survey-template.entity';
import { createNodeSqliteShim } from './database/node-sqlite.shim';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				const dbType = (configService.get<string>('DB_TYPE') || process.env.DB_TYPE || 'sqlite').toLowerCase();

				if (dbType === 'sqlite') {
					const baseDataDir = configService.get<string>('APP_DATA_DIR') || configService.get<string>('DATA_DIR') || getDataDir();
					let dbPath = configService.get<string>('DB_DATABASE') || join(baseDataDir, 'pandora.sqlite');
					if (!isAbsolute(dbPath)) {
						dbPath = join(process.cwd(), dbPath);
					}
					if (!isValidSqlite(dbPath)) {
						dbPath = join(baseDataDir, 'pandora.sqlite');
					}
					const dbExists = isValidSqlite(dbPath);
					const synchronize = configService.get<string>('DB_SYNCHRONIZE') === 'true' || !dbExists;

					let driver: any = undefined;
					try {
						driver = require('sqlite3');
					} catch (_) {
						driver = createNodeSqliteShim();
					}

					return {
						type: 'sqlite',
						database: dbPath,
						driver,
						synchronize,
						dropSchema: false,
						entities,
					};
				}

				return {
					type: 'postgres',
					host: configService.get<string>('DB_HOST'),
					database: configService.get<string>('DB_NAME'),
					username: configService.get<string>('DB_USER'),
					password: configService.get<string>('DB_PASSWORD'),
					port: parseInt(configService.get<string>('DB_PORT'), 10) || 5432,
					synchronize: true,
					dropSchema: false,
					entities,
					retryAttempts: 2,
					retryDelay: 2000,
				};
			},
		}),
		CoursesModule,
		GroupsModule,
		LessonsModule,
		QuestionsModule,
		FilesModule,
		OptionsModule,
		AnswersModule,
		AreasModule,
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
		PollsModule,
		SurveysModule,
		ActivityEvidencesModule,
		AttendanceModule,
		TypeOrmModule.forFeature([User, Institute, SurveyTemplate]),
	],
	providers: [AppInitializerService],
})
export class AppModule {
	static port: number | string;
	constructor(private readonly _configService: ConfigService) {
		AppModule.port = this._configService.get(Configuration.PORT) || process.env.PORT || 3000;
	}
}
