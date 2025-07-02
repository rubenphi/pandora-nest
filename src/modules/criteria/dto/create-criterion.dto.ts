import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCriterionDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	score: number;

	@ApiProperty()
	@IsNotEmpty()
	@IsNumber()
	activityId: number;

	@ApiProperty({ required: false })
	@IsNumber()
	@IsNotEmpty()
	instituteId?: number;
}
