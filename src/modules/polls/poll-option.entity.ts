import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Poll } from './poll.entity';

@Entity({ name: 'poll_options' })
export class PollOption {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	text: string;

	@ManyToOne(() => Poll, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'pollId' })
	poll: Poll;
}
