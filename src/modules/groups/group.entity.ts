import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

import { Course } from 'src/modules/courses/course.entity';

@Entity()
export class Group {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@ManyToOne(() => Course, (course) => course.groups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'course_id' })
	course: Course;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
