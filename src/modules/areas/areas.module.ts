import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { Area } from './area.entity';
import { Course } from 'src/modules/courses/course.entity';

@Module({
    imports: [
		TypeOrmModule.forFeature([Area, Course]),
	],
    providers: [AreasService],
	controllers: [AreasController],
})
export class AreasModule {}
