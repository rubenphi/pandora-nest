import {
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	Unique,
} from 'typeorm';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';
import { User } from '../users/user.entity';
import { Group } from '../groups/group.entity';

@Entity({ name: 'poll_votes' })
@Unique(['poll', 'user']) // For individual votes
// @Unique(['poll', 'group']) // For group votes - cannot easily express "unique if group is not null" in decorator, handled value-side or with partial index
export class PollVote {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Poll, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'pollId' })
	poll: Poll;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;

	@ManyToOne(() => Group, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'groupId' })
	group: Group;

	@ManyToOne(() => PollOption, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'optionId' })
	option: PollOption;

	@CreateDateColumn()
	createdAt: Date;
}
