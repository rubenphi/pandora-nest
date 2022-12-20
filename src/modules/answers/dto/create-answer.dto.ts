import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsNumber } from 'class-validator';

export class CreateAnswerDto {
	@ApiProperty({
		description: 'Option´s id of answer',
	})
	@IsInt()
	readonly optionId: number;
	@ApiProperty({
		description: 'Question´s id of answer',
	})
	@IsInt()
	readonly questionId: number;
	@ApiProperty({
		description: 'Group´s id of answer',
	})
	@IsInt()
	readonly groupId: number;
	@ApiProperty({
		description: 'Lesson´s id of answer',
	})
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Points of answer',
	})
	@IsNumber()
	readonly points: number;
	@ApiProperty({
		description: 'Indicates if the answer is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
