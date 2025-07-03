import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';

export enum MaterialType {
	VIDEO = 'VIDEO',
	PDF = 'PDF',
	IMAGE = 'IMAGE',
	AUDIO = 'AUDIO',
	DOC = 'DOC',
	TEXT_RICH = 'TEXT_RICH',
	TEXT_SHORT = 'TEXT_SHORT',
}

@Entity({ name: 'materials' })
export class Material {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'enum', enum: MaterialType })
	type: MaterialType;

	@Column({ nullable: true })
	url: string;

	@Column()
	exist: boolean;

	@Column({ type: 'text', nullable: true })
	content: string;

	//instituteId

	@ManyToOne(() => Institute, (institute) => institute.materials)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@ManyToOne(() => Lesson, (lesson) => lesson.materials)
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;
}
