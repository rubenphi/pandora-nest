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

import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Option } from 'src/modules/options/option.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { Institute } from '../intitutes/institute.entity';

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
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
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
