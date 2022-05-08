import { Module } from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm'

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



const dotenv = require('dotenv');
dotenv.config()

@Module({
	imports: [
		TypeOrmModule.forRoot({    type: process.env.DB_TYPE as any,
			host: process.env.DB_HOST,
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			dropSchema: false,
			synchronize: true,
			entities: ["dist/**/**/*.entity{.js,.ts}"],
			migrations: ["dist/database/migrations/*{.js,.ts}"]}),
		CoursesModule,
		GroupsModule,
		LessonsModule,
		QuestionsModule,
		FilesModule,
		OptionsModule,
		AnswersModule,
		AreasModule,
		ConfigModule,
	],
})
export class AppModule {
	static port: number | string;
	constructor(private readonly _configService: ConfigService) {
		AppModule.port = this._configService.get(Configuration.PORT);
	}
}
