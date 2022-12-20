import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './area.entity';
import { Course } from 'src/modules/courses/course.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Area, Course, Institute])],
	providers: [AreasService],
	controllers: [AreasController],
})
export class AreasModule {}
