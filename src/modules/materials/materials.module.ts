import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialsController } from './materials.controller';
import { MaterialsService } from './materials.service';
import { FilesModule } from '../files/files.module';
import { MulterModule } from '@nestjs/platform-express';

import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Material, Institute, Lesson]),
		FilesModule, // Import FilesModule directly
	],
	controllers: [MaterialsController],
	providers: [MaterialsService],
	exports: [MaterialsService],
})
export class MaterialsModule {}
