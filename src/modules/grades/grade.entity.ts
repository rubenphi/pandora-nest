import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinTable,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Grade {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => User)
	@JoinTable({ name: 'userId' })
	user: User;

	@ManyToOne(() => Lesson)
	@JoinTable({ name: 'lessonId' })
	lesson: Lesson;

	@ManyToOne(() => Period)
	@JoinTable({ name: 'periodId' })
	period: Period;

	@Column({ nullable: false, type: 'float', default: 0 })
	grade: number;

	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;

	@Column({ nullable: false, default: true })
	exist: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
//id, user, lesson, period, grade, institute, created_at, updated_at
