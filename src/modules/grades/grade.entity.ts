import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinTable,
	JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { Quiz } from '../quizzes/quiz.entity';

@Entity()
export class Grade {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => User)
	@JoinTable({ name: 'userId' })
	user: User;

	@ManyToOne(() => Quiz, (quiz) => quiz.grades)
	@JoinColumn({ name: 'quizId' })
	quiz: Quiz;

	@Column({ type: 'enum', enum: ['regular', 'support'], default: 'regular' })
	gradeType: 'regular' | 'support';

	@ManyToOne(() => Period)
	@JoinTable({ name: 'periodId' })
	period: Period;

	@Column({ nullable: false, type: 'float', default: 0 })
	grade: number;

	@ManyToOne(() => Institute, (institute) => institute.grades)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@Column({ nullable: false, default: true })
	exist: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
