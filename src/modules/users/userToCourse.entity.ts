import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinTable,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { Course } from '../courses/course.entity';
import { User } from './user.entity';

@Entity()
export class UserToCourse {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	userId: number;
	@Column({ nullable: false })
	year: number; 
	@ManyToOne(() => Course, (course) => course.userToCourses)
	@JoinColumn({ name: 'courseId' })
	course: Course;
	@ManyToOne(() => User, (user) => user.userToCourses)
	@JoinColumn({ name: 'userId' })
	user: User;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
