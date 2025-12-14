import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonItem } from './lesson-item.entity';
import { LessonItemsController } from './lesson-items.controller';
import { LessonItemsService } from './lesson-items.service';

import { Lesson } from '../lessons/lesson.entity';

@Module({
	imports: [TypeOrmModule.forFeature([LessonItem, Lesson])],
	controllers: [LessonItemsController],
	providers: [LessonItemsService],
})
export class LessonItemsModule {}
