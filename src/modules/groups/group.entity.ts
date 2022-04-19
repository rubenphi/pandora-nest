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

import { Course } from 'src/modules/courses/course.entity';
import { Answer } from 'src/modules/answers/answer.entity';

@Entity()
export class Group {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@ManyToOne(() => Course, (course) => course.groups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'course_id' })
	course: Course;
	@OneToMany(() => Answer, (answer) => answer.group)
	answers: Answer[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
