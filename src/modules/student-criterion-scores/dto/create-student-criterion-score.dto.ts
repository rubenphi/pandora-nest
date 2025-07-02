import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateStudentCriterionScoreDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	studentId: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	activityId: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	criterionId: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	score: number;

	@ApiProperty({ required: false })
	@IsNumber()
	@IsNotEmpty()
	instituteId?: number;
}
