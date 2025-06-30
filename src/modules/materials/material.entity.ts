import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Institute } from '../institutes/institute.entity';

export enum MaterialType {
	VIDEO = 'VIDEO',
	PDF = 'PDF',
	IMAGE = 'IMAGE',
	AUDIO = 'AUDIO',
	DOC = 'DOC',
}

@Entity({ name: 'materials' })
export class Material {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'enum', enum: MaterialType })
	type: MaterialType;

	@Column()
	url: string;

	@Column()
	exist: boolean;

	@Column({ nullable: true })
	description: string;

	//instituteId

	@ManyToOne(() => Institute, (institute) => institute.materials)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
