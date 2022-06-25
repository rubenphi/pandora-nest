import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';

import { Lesson } from 'src/modules/lessons/lesson.entity';
import { UserToGroup } from '../users/userToGroup.entity';

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
	@OneToMany(() => UserToGroup, (userToGroup) => userToGroup.period)
	userToGroups: UserToGroup[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
