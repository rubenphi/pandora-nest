import { IsString, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'
export class UpdateOptionDto {
	@ApiProperty({
		description: 'Sentence of option',
	})
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
