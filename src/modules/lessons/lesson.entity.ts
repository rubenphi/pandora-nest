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

import { Course } from 'src/modules/courses/course.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { Area } from 'src/modules/areas/area.entity';
import { User } from 'src/modules/users/user.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Lesson {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	topic: string;
	@Column({ nullable: false })
	date: Date;
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;
	@ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'courseId' })
	course: Course;
	@ManyToOne(() => Period, (period) => period.lessons, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'periodId' })
	period: Period;
	@ManyToOne(() => Area, (area) => area.lessons, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'areaId' })
	area: Area;
	@ManyToOne(() => User, (user) => user.lessons, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	author: User;
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
