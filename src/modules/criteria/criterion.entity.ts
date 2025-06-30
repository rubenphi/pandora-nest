import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Activity } from '../activities/activity.entity';
import { Institute } from '../institutes/institute.entity';

@Entity({ name: 'criteria' })
export class Criterion {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	description: string;

	@ManyToOne(() => Activity, (activity) => activity.criteria)
	activity: Activity;

	@ManyToOne(() => Institute, (institute) => institute.criteria)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
