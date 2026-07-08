import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { SurveyTemplate } from './survey-template.entity';

@Entity({ name: 'survey_sessions' })
export class SurveySession {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => SurveyTemplate, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'templateId' })
	template: SurveyTemplate;

	@Column()
	year: number;

	@Column()
	label: string;

	@CreateDateColumn()
	createdAt: Date;
}
