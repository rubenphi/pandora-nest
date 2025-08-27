import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	JoinTable,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { User } from './user.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class UserToCourse {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	year: number;
	@Column({ nullable: false })
	rol: string;
	@Column({ default: true })
	active: boolean;
	@ManyToOne(() => Course, (course) => course.users)
	@JoinColumn({ name: 'courseId' })
	course: Course;
	@ManyToOne(() => User, (user) => user.courses)
	@JoinColumn({ name: 'userId' })
	user: User;

	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
