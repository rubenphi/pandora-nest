import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Activity } from '../activities/activity.entity';
import { Institute } from '../institutes/institute.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';

@Entity({ name: 'criteria' })
export class Criterion {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	description: string;

	@Column({ type: 'float', nullable: true })
	score: number;

	@ManyToOne(() => Activity, (activity) => activity.criteria)
	activity: Activity;

	@OneToMany(() => StudentCriterionScore, (score) => score.criterion)
	studentCriterionScores: StudentCriterionScore[];

	@ManyToOne(() => Institute, (institute) => institute.criteria)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
