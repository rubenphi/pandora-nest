import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import {
	CreateSurveyResponseDto,
	CreateSurveySessionDto,
	CreateSurveyTemplateDto,
	QuerySurveyResponseDto,
	QuerySurveySessionDto,
	QuerySurveyTemplateDto,
	UpdateSurveyTemplateDto,
} from './dto';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';
import { Roles, Role } from '../auth/roles.decorator';

@ApiTags('surveys')
@Controller('surveys')
export class SurveysController {
	constructor(private readonly surveysService: SurveysService) {}

	// ─── Templates ─────────────────────────────────────────────────────

	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Post('templates')
	@ApiOperation({ summary: 'Create a new survey template' })
	@ApiResponse({ status: 201, description: 'Template created.' })
	@ApiResponse({ status: 409, description: 'Slug already exists.' })
	createTemplate(
		@Body() dto: CreateSurveyTemplateDto,
		@User() user: UserEntity,
	) {
		return this.surveysService.createTemplate(dto);
	}

	@Auth()
	@Get('templates')
	@ApiOperation({ summary: 'Get all survey templates' })
	findAllTemplates(@Query() query: QuerySurveyTemplateDto) {
		return this.surveysService.findAllTemplates(query);
	}

	@Auth()
	@Get('templates/:id')
	@ApiOperation({ summary: 'Get a survey template by id' })
	@ApiResponse({ status: 404, description: 'Template not found.' })
	findTemplateById(@Param('id') id: number) {
		return this.surveysService.findTemplateById(id);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator)
	@Auth()
	@Patch('templates/:id')
	@ApiOperation({ summary: 'Update a survey template' })
	@ApiResponse({ status: 404, description: 'Template not found.' })
	updateTemplate(
		@Param('id') id: number,
		@Body() dto: UpdateSurveyTemplateDto,
		@User() user: UserEntity,
	) {
		return this.surveysService.updateTemplate(id, dto);
	}

	@Roles(Role.Admin)
	@Auth()
	@Delete('templates/:id')
	@ApiOperation({ summary: 'Delete a survey template' })
	@ApiResponse({ status: 404, description: 'Template not found.' })
	removeTemplate(@Param('id') id: number, @User() user: UserEntity) {
		return this.surveysService.removeTemplate(id);
	}

	// ─── Sessions ────────────────────────────────────────────────────────

	@Auth()
	@Post('sessions')
	@ApiOperation({ summary: 'Create a survey session' })
	@ApiResponse({ status: 201, description: 'Session created.' })
	createSession(
		@Body() dto: CreateSurveySessionDto,
	) {
		return this.surveysService.createSession(dto);
	}

	@Auth()
	@Get('sessions')
	@ApiOperation({ summary: 'Get survey sessions (optionally filtered)' })
	findAllSessions(@Query() query: QuerySurveySessionDto) {
		return this.surveysService.findAllSessions(query);
	}

	@Auth()
	@Get('sessions/:id')
	@ApiOperation({ summary: 'Get a survey session by id' })
	@ApiResponse({ status: 404, description: 'Session not found.' })
	findSessionById(@Param('id') id: number) {
		return this.surveysService.findSessionById(id);
	}

	// ─── Responses ──────────────────────────────────────────────────────

	@Auth()
	@Post('responses')
	@ApiOperation({ summary: 'Submit a survey response' })
	@ApiResponse({ status: 201, description: 'Response registered.' })
	@ApiResponse({ status: 404, description: 'Template not found.' })
	createResponse(
		@Body() dto: CreateSurveyResponseDto,
		@User() user: UserEntity,
	) {
		return this.surveysService.createResponse(dto);
	}

	@Auth()
	@Get('responses')
	@ApiOperation({ summary: 'Get survey responses (optionally filtered)' })
	findAllResponses(@Query() query: QuerySurveyResponseDto) {
		return this.surveysService.findAllResponses(query);
	}

	@Auth()
	@Get('responses/:id')
	@ApiOperation({ summary: 'Get a survey response by id' })
	@ApiResponse({ status: 404, description: 'Response not found.' })
	findResponseById(@Param('id') id: number) {
		return this.surveysService.findResponseById(id);
	}
}
