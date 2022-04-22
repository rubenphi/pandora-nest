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

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: '127.0.0.1',
			port: 5432,
			username: 'ruben',
			password: 'japon93',
			database: 'pandora',
			autoLoadEntities: true,
			synchronize: true,
		}),
		CoursesModule,
		GroupsModule,
		LessonsModule,
		QuestionsModule,
		FilesModule,
		OptionsModule,
		AnswersModule,
		AreasModule,
	],
})
export class AppModule {}
