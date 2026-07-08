import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyTemplate } from './survey-template.entity';
import { SurveyResponse } from './survey-response.entity';
import { SurveySession } from './survey-session.entity';
import {
	CreateSurveyTemplateDto,
	CreateSurveyResponseDto,
	CreateSurveySessionDto,
	QuerySurveyResponseDto,
	QuerySurveySessionDto,
	QuerySurveyTemplateDto,
	UpdateSurveyTemplateDto,
} from './dto';

@Injectable()
export class SurveysService {
	constructor(
		@InjectRepository(SurveyTemplate)
		private readonly templateRepository: Repository<SurveyTemplate>,
		@InjectRepository(SurveyResponse)
		private readonly responseRepository: Repository<SurveyResponse>,
		@InjectRepository(SurveySession)
		private readonly sessionRepository: Repository<SurveySession>,
	) {}

	// ─── Templates ─────────────────────────────────────────────────────

	async createTemplate(dto: CreateSurveyTemplateDto): Promise<SurveyTemplate> {
		const existing = await this.templateRepository.findOne({
			where: { slug: dto.slug },
		});
		if (existing) {
			throw new ConflictException('A template with this slug already exists');
		}

		const template = this.templateRepository.create({
			name: dto.name,
			slug: dto.slug,
			questionsConfig: dto.questionsConfig,
		});
		return this.templateRepository.save(template);
	}

	async findAllTemplates(query: QuerySurveyTemplateDto): Promise<SurveyTemplate[]> {
		const where: any = {};
		if (query.slug) where.slug = query.slug;
		if (query.active !== undefined) where.active = query.active;

		return this.templateRepository.find({
			where,
			order: { createdAt: 'DESC' },
		});
	}

	async findTemplateById(id: number): Promise<SurveyTemplate> {
		return this.templateRepository
			.findOneOrFail({ where: { id } })
			.catch(() => {
				throw new NotFoundException('Survey template not found');
			});
	}

	async updateTemplate(
		id: number,
		dto: UpdateSurveyTemplateDto,
	): Promise<SurveyTemplate> {
		const template = await this.findTemplateById(id);

		if (dto.slug !== undefined && dto.slug !== template.slug) {
			const existing = await this.templateRepository.findOne({
				where: { slug: dto.slug },
			});
			if (existing) {
				throw new ConflictException('A template with this slug already exists');
			}
		}

		if (dto.name !== undefined) template.name = dto.name;
		if (dto.slug !== undefined) template.slug = dto.slug;
		if (dto.questionsConfig !== undefined)
			template.questionsConfig = dto.questionsConfig;
		if (dto.active !== undefined) template.active = dto.active;

		template.version += 1;

		return this.templateRepository.save(template);
	}

	async removeTemplate(id: number): Promise<void> {
		const template = await this.findTemplateById(id);
		await this.templateRepository.remove(template);
	}

	// ─── Sessions ────────────────────────────────────────────────────────

	async createSession(dto: CreateSurveySessionDto): Promise<SurveySession> {
		const template = await this.findTemplateById(dto.templateId);

		const session = this.sessionRepository.create({
			template,
			year: dto.year,
			label: dto.label,
		});
		return this.sessionRepository.save(session);
	}

	async findAllSessions(query: QuerySurveySessionDto): Promise<SurveySession[]> {
		const where: any = {};
		if (query.templateId) where.template = { id: query.templateId };
		if (query.year) where.year = query.year;

		return this.sessionRepository.find({
			where,
			relations: ['template'],
			order: { createdAt: 'DESC' },
		});
	}

	async findSessionById(id: number): Promise<SurveySession> {
		return this.sessionRepository
			.findOneOrFail({ where: { id }, relations: ['template'] })
			.catch(() => {
				throw new NotFoundException('Survey session not found');
			});
	}

	// ─── Responses ──────────────────────────────────────────────────────

	async createResponse(dto: CreateSurveyResponseDto): Promise<SurveyResponse> {
		const template = await this.findTemplateById(dto.templateId);

		let session: SurveySession | null = null;
		if (dto.sessionId) {
			session = await this.sessionRepository
				.findOneOrFail({ where: { id: dto.sessionId } })
				.catch(() => {
					throw new NotFoundException('Survey session not found');
				});
		}

		const response = this.responseRepository.create({
			template,
			session,
			code: dto.code,
			answers: dto.answers,
			imageUrl: dto.imageUrl || null,
			respondent: dto.respondent || null,
		});
		return this.responseRepository.save(response);
	}

	async findAllResponses(query: QuerySurveyResponseDto): Promise<SurveyResponse[]> {
		const where: any = {};
		if (query.templateId) where.template = { id: query.templateId };
		if (query.respondent) where.respondent = query.respondent;
		if (query.sessionId) where.session = { id: query.sessionId };

		return this.responseRepository.find({
			where,
			relations: ['template', 'session'],
			order: { createdAt: 'DESC' },
		});
	}

	async findResponseById(id: number): Promise<SurveyResponse> {
		return this.responseRepository
			.findOneOrFail({
				where: { id },
				relations: ['template', 'session'],
			})
			.catch(() => {
				throw new NotFoundException('Survey response not found');
			});
	}
}
