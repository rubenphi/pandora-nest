import { Activity } from 'src/modules/activities/activity.entity';
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
import { Area } from 'src/modules/areas/area.entity';
import { User } from 'src/modules/users/user.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { LessonItem } from '../lesson-items/lesson-item.entity';
import { Quiz } from 'src/modules/quizzes/quiz.entity';
import { Material } from '../materials/material.entity';

export enum LessonType {
	STANDARD = 'standard',
	REINFORCEMENT = 'reinforcement',
}

@Entity()
export class Lesson {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	topic: string;
	@Column({ nullable: false, default: new Date().getFullYear() })
	year: number;
	@Column({ nullable: false })
	date: Date;
	@ManyToOne(() => Institute, (institute) => institute.lessons)
	@JoinColumn({ name: 'instituteId' })
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
	@OneToMany(() => LessonItem, (item) => item.lesson)
	items: LessonItem[];
	@OneToMany(() => Quiz, (quiz) => quiz.lesson)
	quizzes: Quiz[];
	@OneToMany(() => Activity, (activity) => activity.lesson)
	activities: Activity[];
	@OneToMany(() => Material, (material) => material.lesson)
	materials: Material[];
	@Column({ nullable: false })
	exist: boolean;
	@Column({
		type: 'enum',
		enum: LessonType,
		default: LessonType.STANDARD,
	})
	type: LessonType;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
