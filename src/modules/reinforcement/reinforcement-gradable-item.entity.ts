import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Reinforcement } from './reinforcement.entity';
import { GRADABLE_ENTITIES } from '../grades/grade.entity';

@Entity()
export class ReinforcementGradableItem {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Reinforcement, (reinforcement) => reinforcement.gradableItems)
	@JoinColumn({ name: 'reinforcementId' })
	reinforcement: Reinforcement;

	@Column()
	reinforcementId: number;

	@Column()
	gradableId: number;

	@Column({ type: 'enum', enum: GRADABLE_ENTITIES })
	gradableType: string;
}
