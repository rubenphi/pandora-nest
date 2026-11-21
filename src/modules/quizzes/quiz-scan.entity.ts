import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../users/user.entity';
import { Institute } from '../institutes/institute.entity';

@Entity({ name: 'quiz_scans' })
export class QuizScan {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'quizId' })
	quiz: Quiz;

	@Column({ type: 'int' })
	quizId: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	user: User;

	@Column({ type: 'int' })
	userId: number;

	@Column({ type: 'int', default: 1 })
	section: number;

	@Column({ type: 'varchar', length: 255 })
	imageUrl: string;

	@Column({ type: 'varchar', length: 255 })
	filename: string;

	@ManyToOne(() => Institute, { onDelete: 'CASCADE', nullable: true })
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@Column({ type: 'int', nullable: true })
	instituteId: number;

	@CreateDateColumn()
	createdAt: Date;
}
