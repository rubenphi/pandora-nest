import { IsInt, IsBoolean } from 'class-validator';

export class CreateAnswerDto {

	@IsInt()
	readonly option_id: number;
	@IsInt()
	readonly question_id: number;
	@IsInt()
	readonly group_id: number;
	@IsInt()
	readonly lesson_id: number;
	@IsBoolean()
	readonly exist: boolean;
}
