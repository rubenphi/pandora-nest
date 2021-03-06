import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './lesson.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Course, Area])],
  providers: [LessonsService],
  controllers: [LessonsController]
})
export class LessonsModule {}
