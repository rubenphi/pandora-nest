import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
import { Period } from '../periods/period.entity';
import { User } from '../users/user.entity';
import { PollOption } from './poll-option.entity';
import { PollVote } from './poll-vote.entity';

@Entity({ name: 'polls' })
export class Poll {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column()
	question: string;

	@Column({ type: 'enum', enum: ['group', 'individual'], default: 'group' })
	mode: 'group' | 'individual';

	@Column({ default: true })
	active: boolean;

	@Column({ nullable: true })
	closedAt: Date;

	@CreateDateColumn()
	createdAt: Date;

	@ManyToOne(() => Course, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'courseId' })
	course: Course;

	@ManyToOne(() => Period, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'periodId' })
	period: Period;

	@Column({ default: 2025 })
	year: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'creatorId' })
	creator: User;

	@OneToMany(() => PollOption, (option) => option.poll)
	options: PollOption[];

	@OneToMany(() => PollVote, (vote) => vote.poll)
	votes: PollVote[];
}
