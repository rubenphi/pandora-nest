
import { Controller } from '@nestjs/common';
import { CriteriaService } from './criteria.service';

@Controller('criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}
}
