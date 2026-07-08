import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { SurveyResponse } from './survey-response.entity';

@Entity({ name: 'survey_templates' })
export class SurveyTemplate {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column({ unique: true })
	slug: string;

	@Column({ default: 1 })
	version: number;

	@Column('jsonb')
	questionsConfig: Record<string, any>;

	@Column({ default: true })
	active: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@OneToMany(() => SurveyResponse, (response) => response.template)
	responses: SurveyResponse[];
}
