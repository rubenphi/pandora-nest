import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { SurveyTemplate } from './survey-template.entity';
import { SurveyResponse } from './survey-response.entity';
import { SurveySession } from './survey-session.entity';

@Module({
	imports: [TypeOrmModule.forFeature([SurveyTemplate, SurveyResponse, SurveySession])],
	controllers: [SurveysController],
	providers: [SurveysService],
	exports: [SurveysService],
})
export class SurveysModule {}
