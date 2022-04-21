import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';


import { Option } from 'src/modules/options/option.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Group } from 'src/modules/groups/group.entity';
import { Lesson } from 'src/modules/lessons/lesson.entity';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@ManyToOne(() => Option, (option) => option.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'option_id' })
	option: Option;
	@ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'question_id' })
	question: Question;
	@ManyToOne(() => Group, (group) => group.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'group_id' })
	group: Group;
	@ManyToOne(() => Lesson, (lesson) => lesson.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'lesson_id' })
	lesson: Lesson;
	@Column({ nullable: false, type: 'decimal' , precision: 50, scale: 2, default: 0.0  })
	points:  number;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
