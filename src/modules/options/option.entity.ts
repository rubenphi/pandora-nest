import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	JoinTable,
} from 'typeorm';

import { Question } from 'src/modules/questions/question.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Option {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	correct: boolean;
	@Column({ nullable: false })
	identifier: string;
	@Column({ nullable: false })
	sentence: string;
	@ManyToOne(() => Question, (question) => question.options, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'questionId' })
	question: Question;
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;
	@OneToMany(() => Answer, (answer) => answer.option)
	answers: Answer[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
