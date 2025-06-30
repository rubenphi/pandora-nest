
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criterion } from './criterion.entity';

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criterion)
    private readonly criterionRepository: Repository<Criterion>,
  ) {}
}
