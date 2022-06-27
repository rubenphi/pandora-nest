import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToMany,
	JoinTable,
	ManyToOne,
} from 'typeorm';

import { Group } from 'src/modules/groups/group.entity';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Area } from 'src/modules/areas/area.entity';
import { UserToCourse } from '../users/userToCourse.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Course {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;
	@ManyToMany(() => Area)
	@JoinTable()
	areas: Area[];
	@Column({ nullable: false })
	exist: boolean;
	@OneToMany(() => Group, (group) => group.course)
	groups: Group[];
	@OneToMany(() => Lesson, (lesson) => lesson.course)
	lessons: Lesson[];
	@OneToMany(() => UserToCourse, (userToCourse) => userToCourse.course)
	userToCourses: UserToCourse[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
