import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbilityModule } from '../ability/ability.module';
import { Institute } from './institute.entity';
import { Course } from '../courses/course.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Institute, Course]), AbilityModule],
	providers: [InstitutesService],
	controllers: [InstitutesController],
})
export class InstitutesModule {}
