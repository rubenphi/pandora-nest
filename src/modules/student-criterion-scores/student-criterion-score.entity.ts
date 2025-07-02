import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Activity } from '../activities/activity.entity';
import { Criterion } from '../criteria/criterion.entity';
import { Institute } from '../institutes/institute.entity';

@Entity({ name: 'student_criterion_scores' })
export class StudentCriterionScore {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'float' })
	score: number;

	@ManyToOne(() => User, (user) => user.studentCriterionScores)
	@JoinColumn({ name: 'studentId' })
	student: User;

	@ManyToOne(() => Activity, (activity) => activity.studentCriterionScores)
	@JoinColumn({ name: 'activityId' })
	activity: Activity;

	@ManyToOne(() => Criterion, (criterion) => criterion.studentCriterionScores)
	@JoinColumn({ name: 'criterionId' })
	criterion: Criterion;

	@ManyToOne(() => User, (user) => user.gradedCriterionScores)
	@JoinColumn({ name: 'gradedById' })
	gradedBy: User;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	gradedAt: Date;

	@ManyToOne(() => Institute, (institute) => institute.studentCriterionScores)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
