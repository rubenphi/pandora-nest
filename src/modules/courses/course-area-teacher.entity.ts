import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Area } from '../areas/area.entity';
import { User } from '../users/user.entity';

@Entity()
export class CourseAreaTeacher {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Course, (course) => course.courseAreaTeachers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'courseId' })
	course: Course;

	@ManyToOne(() => Area, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'areaId' })
	area: Area;

	@ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
	@JoinColumn({ name: 'teacherId' })
	teacher: User;

	@Column({ nullable: false })
	year: number;

	@Column({ default: true })
	active: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
