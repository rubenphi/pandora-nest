import { Activity } from '../activities/activity.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'student_criterion_permissions' })
export class StudentCriterionPermission {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'int' })
	reviserId: number;

	@Column({ type: 'enum', enum: ['Group', 'User'] })
	reviserType: 'Group' | 'User';

	@Column({ type: 'int' })
	revisedId: number;

	@Column({ type: 'enum', enum: ['Group', 'User'] })
	revisedType: 'Group' | 'User';

	@ManyToOne(() => Activity, {
		onDelete: 'CASCADE',
	})
	activity: Activity;

	@Column({ type: 'boolean', default: false })
	expired: boolean;
}
