import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { Institute } from '../institutes/institute.entity';
import { Question } from '../questions/question.entity';
import { Option } from '../options/option.entity';
import { Period } from '../periods/period.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Lesson,
			Course,
			Area,
			Institute,
			Question,
			Option,
			Period
		]),
	],
	providers: [LessonsService],
	controllers: [LessonsController],
})
export class LessonsModule {}
