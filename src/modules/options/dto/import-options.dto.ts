import { IsInt } from 'class-validator';

export class ImportOptionsDto {
	@IsInt()
	readonly from_question: number;
	@IsInt()
	readonly to_question: number;
}
