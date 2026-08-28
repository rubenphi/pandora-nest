import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Activity } from '../activities/activity.entity';
import { Institute } from '../institutes/institute.entity';

@Entity({ name: 'activity_evidences' })
export class ActivityEvidence {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'text' })
	pdfUrl: string;

	@Column({ type: 'varchar', length: 255 })
	filename: string;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'studentId' })
	student: User;

	@Column({ type: 'int' })
	studentId: number;

	@ManyToOne(() => Activity)
	@JoinColumn({ name: 'activityId' })
	activity: Activity;

	@Column({ type: 'int' })
	activityId: number;

	@ManyToOne(() => Institute)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@Column({ type: 'int' })
	instituteId: number;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date;
}
