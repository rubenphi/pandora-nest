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

@Entity({ name: 'activities' })
export class Activity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'text', nullable: true })
	instructions: string;

	@OneToMany(() => Criterion, (criterion) => criterion.activity)
	criteria: Criterion[];

	@ManyToOne(() => Institute, (institute) => institute.activities)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
