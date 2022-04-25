import { IsString, IsInt, IsBoolean } from 'class-validator';

export class UpdateOptionDto {
	@IsString()
	readonly sentence: string;
	@IsBoolean()
	readonly correct: boolean;
	@IsString()
	readonly identifier: string;
	@IsInt()
	readonly questionId: number;
	@IsBoolean()
	readonly exist: boolean;
}
