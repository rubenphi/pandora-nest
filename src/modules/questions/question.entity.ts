import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';

import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Option } from 'src/modules/options/option.entity';
import { Answer } from 'src/modules/answers/answer.entity';

@Entity()
export class Question {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	title: string;
	@Column({ nullable: false })
	sentence: string;
	@ManyToOne(() => Lesson, (lesson) => lesson.questions, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'lesson_id' })
	lesson: Lesson;
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
