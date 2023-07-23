import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Group } from '../groups/group.entity';
import { Period } from '../periods/period.entity';
import { User } from './user.entity';

@Entity()
export class UserToGroup {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@ManyToOne(() => Period, (period) => period.userToGroups)
	@JoinColumn({ name: 'periodId' })
	period: Period;

	@ManyToOne(() => Group, (group) => group.userToGroups)
	@JoinColumn({ name: 'groupId' })
	group: Group;
	@ManyToOne(() => User, (user) => user.groups)
	@JoinColumn({ name: 'userId' })
	user: User;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
