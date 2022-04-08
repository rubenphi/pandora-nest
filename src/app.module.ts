import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesModule } from './modules/courses/courses.module';
import { GroupsModule } from './modules/groups/groups.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { FilesController } from './modules/files/files.controller';
import { FilesModule } from './modules/files/files.module';
import { OptionsModule } from './modules/options/options.module';


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
	],
	controllers: [FilesController]
})
export class AppModule {}
