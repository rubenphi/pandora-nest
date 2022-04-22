import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Area } from '../areas/area.entity'
import { Course } from './course.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Course, Area])],
	controllers: [CoursesController],
	providers: [CoursesService],
})
export class CoursesModule {}
