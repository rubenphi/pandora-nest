import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAnswerDto {
	@ApiProperty({
		description: 'Option´s id of answer',
	})
	@IsInt()
	@IsOptional()
	readonly optionId: number;
	@ApiProperty({
		description: 'Question´s id of answer',
	})
	@IsInt()
	@IsOptional()
	readonly questionId: number;
	@ApiProperty({
		description: 'Group´s id of answer',
	})
	@IsInt()
	@IsOptional()
	readonly groupId: number;
	@ApiProperty({
		description: 'Lesson´s id of answer',
	})
	@IsInt()
	@IsOptional()
	readonly lessonId: number;
	@ApiProperty({
		description: 'Points of answer',
	})
	@IsNumber()
	@IsOptional()
	readonly points: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the course is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
