import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
	JoinTable,
} from 'typeorm';

import { Course } from 'src/modules/courses/course.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { UserToGroup } from '../users/userToGroup.entity';
import { Institute } from '../institutes/institute.entity';
import { Period } from '../periods/period.entity';

@Entity()
export class Group {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;

	@ManyToOne(() => Institute, (institute) => institute.groups)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@ManyToOne(() => Course, (course) => course.groups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'courseId' })
	course: Course;
	@ManyToOne(() => Period, (period) => period.groups, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'periodId' })
	period: Period;
	@Column({ nullable: false })
	year: number;
	@OneToMany(() => Answer, (answer) => answer.group)
	answers: Answer[];
	@Column({ nullable: false })
	active: boolean;
	@Column({ nullable: false })
	exist: boolean;
	@OneToMany(() => UserToGroup, (userToGroup) => userToGroup.group)
	usersToGroup: UserToGroup[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
