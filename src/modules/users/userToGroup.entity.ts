import {
	Entity,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	Column,
} from 'typeorm';
import { Group } from '../groups/group.entity';
import { User } from './user.entity';

@Entity()
export class UserToGroup {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@ManyToOne(() => Group, (group) => group.usersToGroup)
	@JoinColumn({ name: 'groupId' })
	group: Group;
	@ManyToOne(() => User, (user) => user.groups)
	@JoinColumn({ name: 'userId' })
	user: User;
	@Column({ type: 'int', nullable: false })
	year: number;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
	@Column({ nullable: false, default: true })
	active: boolean;
}
