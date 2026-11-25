import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Course } from '../courses/course.entity';
import { Lesson } from '../lessons/lesson.entity';
import { User } from '../users/user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			AttendanceSession,
			AttendanceRecord,
			Course,
			Lesson,
			User,
		]),
	],
	controllers: [AttendanceController],
	providers: [AttendanceService],
	exports: [AttendanceService],
})
export class AttendanceModule {}
