import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { SurveyTemplate } from './survey-template.entity';
import { SurveySession } from './survey-session.entity';

@Entity({ name: 'survey_responses' })
export class SurveyResponse {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => SurveyTemplate, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'templateId' })
	template: SurveyTemplate;

	@ManyToOne(() => SurveySession, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'sessionId' })
	session: SurveySession;

	@Column({ length: 10 })
	code: string;

	@Column('jsonb')
	answers: Record<string, any>;

	@Column({ nullable: true })
	imageUrl: string;

	@Column({ nullable: true })
	respondent: string;

	@CreateDateColumn()
	createdAt: Date;
}
