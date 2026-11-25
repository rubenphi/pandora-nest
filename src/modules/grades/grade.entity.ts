import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinTable,
	JoinColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Activity } from '../activities/activity.entity';

// Types for polymorphic relation
export type Gradable = Quiz | Activity;
export const GRADABLE_ENTITIES = ['quiz', 'activity'];

export enum SubmissionStatus {
	NOT_SUBMITTED = 'NOT_SUBMITTED',
	SUBMITTED = 'SUBMITTED',
	UNKNOWN = 'UNKNOWN',
}

export enum EvaluationStatus {
	NOT_EVALUATED = 'NOT_EVALUATED',
	PARTIAL = 'PARTIAL',
	GRADED = 'GRADED',
}

export type AuditClassification =
	| 'NO_SUBMISSION'
	| 'PENDING_GRADING'
	| 'GRADED_ZERO'
	| 'NEEDS_REVIEW'
	| 'GRADED';

@Entity()
export class Grade {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => User)
	@JoinTable({ name: 'userId' })
	user: User;

	@Column()
	gradableId: number;

	@Column()
	gradableType: string;

	// This property will be populated manually in the service
	gradableItem?: Gradable;

	@Column({
		type: 'simple-enum',
		enum: ['regular', 'support'],
		default: 'regular',
	})
	gradeType: 'regular' | 'support';

	@Column({
		type: 'simple-enum',
		enum: ['knowledge', 'execution', 'behavior'],
		nullable: true,
	})
	classification: 'knowledge' | 'execution' | 'behavior';

	@ManyToOne(() => Period)
	@JoinTable({ name: 'periodId' })
	period: Period;

	@Column({ nullable: true, type: 'float', default: null })
	grade: number | null;

	@Column({
		type: 'simple-enum',
		enum: SubmissionStatus,
		nullable: true,
		default: null,
	})
	submissionStatus?: SubmissionStatus | null;

	@Column({
		type: 'simple-enum',
		enum: EvaluationStatus,
		nullable: true,
		default: null,
	})
	evaluationStatus?: EvaluationStatus | null;

	// Non-persisted derived audit fields populated by GradesService
	derivedSubmissionStatus?: SubmissionStatus;
	derivedEvaluationStatus?: EvaluationStatus;
	auditClassification?: AuditClassification;

	@ManyToOne(() => Institute, (institute) => institute.grades)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@Column({ nullable: false, default: true })
	exist: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
