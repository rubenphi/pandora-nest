import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsArray, ValidateNested, IsOptional } from 'class-validator';

class AnswerItemDto {
	@ApiProperty({ description: 'Option´s id of answer' })
	@IsInt()
	readonly optionId: number;

	@ApiProperty({ description: 'Question´s id of answer' })
	@IsInt()
	readonly questionId: number;
}

export class CreateBulkAnswersDto {
	@ApiProperty({
		description: 'Quiz´s id for the answers',
	})
	@IsInt()
	readonly quizId: number;

	@ApiProperty({
		description: 'Group´s id for the answers',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly groupId?: number;

	@ApiProperty({
		description: 'User´s id for the answers',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly userId?: number;

	@ApiProperty({
		description: 'Institute id for the answers',
	})
	@IsInt()
	readonly instituteId: number;

	@ApiProperty({
		description: 'List of answers to be created',
		type: [AnswerItemDto],
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AnswerItemDto)
	readonly answers: AnswerItemDto[];
}
