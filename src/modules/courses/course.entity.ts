import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

import { Group } from 'src/modules/groups/group.entity';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Area } from 'src/modules/areas/area.entity';
import { UserToCourse } from '../users/userToCourse.entity';
import { Institute } from '../institutes/institute.entity';
import { CourseAreaTeacher } from './course-area-teacher.entity';
import { CourseArea } from './course-area.entity'; // New import

@Entity()
export class Course {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@ManyToOne(() => Institute, (institute) => institute.courses)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@Column({ nullable: false })
	exist: boolean;
	@OneToMany(() => Group, (group) => group.course)
	groups: Group[];
	@OneToMany(() => Lesson, (lesson) => lesson.course)
	lessons: Lesson[];
	@OneToMany(() => UserToCourse, (userToCourse) => userToCourse.course)
	users: UserToCourse[];
	@OneToMany(
		() => CourseAreaTeacher,
		(courseAreaTeacher) => courseAreaTeacher.course,
	)
	courseAreaTeachers: CourseAreaTeacher[];
	@OneToMany(() => CourseArea, (courseArea) => courseArea.course) // New relation
	courseAreas: CourseArea[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
