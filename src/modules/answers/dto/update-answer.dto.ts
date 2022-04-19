import { IsNumber,IsInt, IsBoolean } from 'class-validator';

export class UpdateAnswerDto {
	@IsInt()
	readonly option_id: number;
	@IsInt()
	readonly question_id: number;
	@IsInt()
	readonly group_id: number;
	@IsInt()
	readonly lesson_id: number;
	@IsNumber()
	readonly points: number;
	@IsBoolean()
	readonly exist: boolean;
}