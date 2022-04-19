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

import { Course } from 'src/modules/courses/course.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Answer } from 'src/modules/answers/answer.entity';


@Entity()
export class Lesson {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	theme: string;
	@Column({ nullable: false })
	date: Date;
	@ManyToOne(() => Course, (course) => course.groups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'course_id' })
	course: Course;
	@OneToMany(() => Question, (question) => question.lesson)
	questions: Question[];
	@OneToMany(() => Answer, (answer) => answer.group)
	answers: Answer[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
