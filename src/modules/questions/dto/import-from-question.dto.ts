import { IsInt } from 'class-validator';

export class ImportFromQuestionDto {
	@IsInt()
	readonly fromQuestionId: number;
}
