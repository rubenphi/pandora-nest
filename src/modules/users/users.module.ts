import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Institute } from '../institutes/institute.entity';
import { Invitation } from '../invitations/invitation.entity';
import { UserToCourse } from './userToCourse.entity';
import { UserToGroup } from './userToGroup.entity';
import { AlumnosController } from './colonline.controller';
import { Course } from '../courses/course.entity';
import { CourseArea } from '../courses/course-area.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			User,
			Institute,
			Invitation,
			UserToCourse,
			UserToGroup,
			Course, // Add Course entity here
			CourseArea,
		]),
	],
	providers: [UsersService],
	controllers: [UsersController, AlumnosController],
	exports: [UsersService],
})
export class UsersModule {}
