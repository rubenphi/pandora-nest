import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Activity, Lesson, Institute])],
	controllers: [ActivitiesController],
	providers: [ActivitiesService],
	exports: [ActivitiesService],
})
export class ActivitiesModule {}
