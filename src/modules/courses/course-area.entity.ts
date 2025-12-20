import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Area } from '../areas/area.entity';

@Entity('course_area')
export class CourseArea {
	@PrimaryGeneratedColumn()
	id: number;

	@ManyToOne(() => Course, (course) => course.courseAreas)
	@JoinColumn({ name: 'course_id' })
	course: Course;

	@ManyToOne(() => Area, (area) => area.courseAreas)
	@JoinColumn({ name: 'area_id' })
	area: Area;

	@Column({ type: 'date' })
	start_date: Date;

	@Column({ type: 'date', nullable: true })
	end_date: Date;

	@Column({ type: 'boolean', default: true })
	active: boolean;
}
