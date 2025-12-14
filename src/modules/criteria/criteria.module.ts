import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Criterion } from './criterion.entity';
import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';
import { Activity } from '../activities/activity.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Criterion, Activity, Institute])],
	controllers: [CriteriaController],
	providers: [CriteriaService],
	exports: [CriteriaService],
})
export class CriteriaModule {}
