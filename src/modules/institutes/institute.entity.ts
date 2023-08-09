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
import { Answer } from '../answers/answer.entity';
import { Area } from '../areas/area.entity';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Option } from '../options/option.entity';
import { Period } from '../periods/period.entity';
import { Question } from '../questions/question.entity';
import { User } from '../users/user.entity';
import { Invitation } from '../invitations/invitation.entity';

@Entity()
export class Institute {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@OneToMany(() => Answer, (answer) => answer.institute)
	answers: Answer[];
	@OneToMany(() => Course, (course) => course.institute)
	courses: Course[];
	@OneToMany(() => Area, (area) => area.institute)
	areas: Area[];
	@OneToMany(() => Group, (group) => group.institute)
	groups: Group[];
	@OneToMany(() => Lesson, (lesson) => lesson.institute)
	lessons: Lesson[];
	@OneToMany(() => Option, (option) => option.institute)
	options: Option[];
	@OneToMany(() => Period, (period) => period.institute)
	periods: Period[];
	@OneToMany(() => Question, (question) => question.institute)
	questions: Question[];
	@OneToMany(() => Invitation, (invitation) => invitation.institute)
	invitations: Invitation[];
	@OneToMany(() => User, (user) => user.institute)
	users: User[];
	@ManyToOne(() => User, (user) => user.institute, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	owner: User;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
