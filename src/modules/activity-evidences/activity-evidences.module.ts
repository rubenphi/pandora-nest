import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEvidence } from './activity-evidence.entity';
import { ActivityEvidencesService } from './activity-evidences.service';
import { ActivityEvidencesController } from './activity-evidences.controller';

@Module({
	imports: [TypeOrmModule.forFeature([ActivityEvidence])],
	providers: [ActivityEvidencesService],
	controllers: [ActivityEvidencesController],
	exports: [ActivityEvidencesService],
})
export class ActivityEvidencesModule {}
