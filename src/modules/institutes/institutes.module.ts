import { Module } from '@nestjs/common';
import { InstitutesService } from './institutes.service';
import { InstitutesController } from './institutes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institute } from './institute.entity';
import { Course } from '../courses/course.entity';
import { User } from '../users/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Institute, Course, User])],
	providers: [InstitutesService],
	controllers: [InstitutesController],
})
export class InstitutesModule {}
