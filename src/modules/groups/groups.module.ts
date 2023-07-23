import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { Group } from './group.entity';
import { Course } from '../courses/course.entity';
import { Institute } from '../institutes/institute.entity';
import { Period } from '../periods/period.entity';
import { UserToGroup } from '../users/userToGroup.entity';
import { User } from '../users/user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Group,
			Course,
			Institute,
			Period,
			UserToGroup,
			User,
		]),
	],
	providers: [GroupsService],
	controllers: [GroupsController],
})
export class GroupsModule {}
