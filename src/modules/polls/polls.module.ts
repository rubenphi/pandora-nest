import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsService } from './polls.service';
import { PollsController } from './polls.controller';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';
import { PollVote } from './poll-vote.entity';
import { Group } from '../groups/group.entity';

import { Course } from '../courses/course.entity';
import { Period } from '../periods/period.entity';
import { UserToGroup } from '../users/userToGroup.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Poll,
			PollOption,
			PollVote,
			Group,
			Course,
			Period,
			UserToGroup,
		]),
	],
	controllers: [PollsController],
	providers: [PollsService],
	exports: [PollsService],
})
export class PollsModule {}
