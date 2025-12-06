import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Criterion } from '../criteria/criterion.entity';
import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';

@Entity({ name: 'activities' })
export class Activity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text', nullable: true })
	instructions: string;

	@Column({
		type: 'enum',
		enum: ['knowledge', 'execution', 'behavior'],
		default: 'execution',
	})
	classification: 'knowledge' | 'execution' | 'behavior';

	@ManyToOne(() => Lesson, (lesson) => lesson.activities)
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;

	@OneToMany(() => Criterion, (criterion) => criterion.activity)
	criteria: Criterion[];

	@OneToMany(() => StudentCriterionScore, (score) => score.activity)
	studentCriterionScores: StudentCriterionScore[];

	@ManyToOne(() => Institute, (institute) => institute.activities)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
