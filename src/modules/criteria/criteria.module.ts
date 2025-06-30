
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Criterion } from './criterion.entity';
import { CriteriaController } from './criteria.controller';
import { CriteriaService } from './criteria.service';

@Module({
  imports: [TypeOrmModule.forFeature([Criterion])],
  controllers: [CriteriaController],
  providers: [CriteriaService],
})
export class CriteriaModule {}
