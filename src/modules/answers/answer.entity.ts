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
import { Institute } from '../intitutes/institute.entity';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@ManyToOne(() => Option, (option) => option.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'optionId' })
	option: Option;
	@ManyToOne(() => Question, (question) => question.answers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'questionId' })
	question: Question;
	@ManyToOne(() => Institute, (institute) => institute.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@ManyToOne(() => Group, (group) => group.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'groupId' })
	group: Group;
	@ManyToOne(() => Lesson, (lesson) => lesson.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;
	@Column({
		nullable: false,
		type: 'decimal',
		precision: 50,
		scale: 2,
		default: 0.0,
	})
	points: number;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
