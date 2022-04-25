import { IsNumber,IsInt, IsBoolean } from 'class-validator';

export class UpdateAnswerDto {
	@IsInt()
	readonly optionId: number;
	@IsInt()
	readonly questionId: number;
	@IsInt()
	readonly groupId: number;
	@IsInt()
	readonly lessonId: number;
	@IsNumber()
	readonly points: number;
	@IsBoolean()
	readonly exist: boolean;
}