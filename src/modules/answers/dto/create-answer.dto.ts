import { IsInt, IsBoolean } from 'class-validator';

export class CreateAnswerDto {

	@IsInt()
	readonly optionId: number;
	@IsInt()
	readonly questionId: number;
	@IsInt()
	readonly groupId: number;
	@IsInt()
	readonly lessonId: number;
	@IsBoolean()
	readonly exist: boolean;
}
