import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';

import { Group } from 'src/modules/groups/group.entity';
@Entity()
export class Course {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@Column({ nullable: false })
	exist: boolean;

	@OneToMany(() => Group, (group) => group.course)
	groups: Group[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
