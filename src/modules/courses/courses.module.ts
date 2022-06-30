import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { Area } from '../areas/area.entity';
import { Course } from './course.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Course, Area, Institute])],
	controllers: [CoursesController],
	providers: [CoursesService],
})
export class CoursesModule {}
