import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinTable,
	JoinColumn,
} from 'typeorm';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';
import { CourseArea } from '../courses/course-area.entity'; // New import

@Entity()
export class Area {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@ManyToOne(() => Institute, (institute) => institute.areas)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@OneToMany(() => Lesson, (lesson) => lesson.area)
	lessons: Lesson[];
	@OneToMany(() => CourseArea, (courseArea) => courseArea.area) // New relation
	courseAreas: CourseArea[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
