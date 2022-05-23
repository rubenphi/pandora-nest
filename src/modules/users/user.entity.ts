import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany
} from 'typeorm';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { UserToCourse } from './userToCourse.entity';
import { UserToGroup } from './userToGroup.entity';

@Entity()
export class User {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@Column({ nullable: false })
	lastName: string;
	@Column({ nullable: true })
	email: string;
	@Column({ nullable: false })
	code: string;
	@Column({ nullable: false })
	exist: boolean;
	@Column({ nullable: false })
	password: string;
	@OneToMany(() => Lesson, (lesson) => lesson.author)
	lessons: Lesson[];
	@OneToMany(() => UserToCourse, (userToCourse) => userToCourse.user)
	userToCourses: UserToCourse[];
	@OneToMany(() => UserToGroup, (userToGroup) => userToGroup.user)
	userToGroups: UserToGroup[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}