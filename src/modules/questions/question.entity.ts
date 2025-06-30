import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
	JoinTable,
} from 'typeorm';

import { Quiz } from '../quizzes/quiz.entity';
import { Option } from 'src/modules/options/option.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Question {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	title: string;
	@Column({ nullable: false })
	sentence: string;
	@ManyToOne(() => Quiz, (quiz) => quiz.questions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'quizId' })
	quiz: Quiz;
	@ManyToOne(() => Institute, (institute) => institute.questions)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@OneToMany(() => Answer, (answer) => answer.question)
	answers: Answer[];
	@OneToMany(() => Option, (option) => option.question)
	options: Option[];
	@Column({ nullable: false })
	points: number;
	@Column({ nullable: true })
	photo: string;
	@Column({ nullable: false })
	visible: boolean;
	@Column({ nullable: false })
	available: boolean;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
