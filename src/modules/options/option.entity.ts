import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany
} from 'typeorm';

import { Question } from 'src/modules/questions/question.entity';
import { Answer } from 'src/modules/answers/answer.entity';

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
	@JoinColumn({ name: 'question_id' })
	question: Question;
	@OneToMany(() => Answer, (answer) => answer.option)
	answers: Answer[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
