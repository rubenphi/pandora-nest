import { PartialType } from '@nestjs/swagger';
import { CreateStudentCriterionScoreDto } from './create-student-criterion-score.dto';

export class UpdateStudentCriterionScoreDto extends PartialType(
	CreateStudentCriterionScoreDto,
) {}
