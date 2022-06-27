import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	JoinTable,
	ManyToOne,
} from 'typeorm';

import { Lesson } from 'src/modules/lessons/lesson.entity';
import { UserToGroup } from '../users/userToGroup.entity';
import { Institute } from '../institutes/institute.entity';

@Entity()
export class Period {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@Column({ nullable: false })
	exist: boolean;
	@OneToMany(() => Lesson, (lesson) => lesson.period)
	lessons: Lesson[];
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;
	@OneToMany(() => UserToGroup, (userToGroup) => userToGroup.period)
	userToGroups: UserToGroup[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
