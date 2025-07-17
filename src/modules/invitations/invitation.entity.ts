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

import { Institute } from '../institutes/institute.entity';

@Entity()
export class Invitation {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false, unique: true })
	code: string;
	@Column({ nullable: false })
	expirationDate: string;
	@ManyToOne(() => Institute, (institute) => institute.invitations)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@Column({ nullable: false })
	valid: boolean;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
