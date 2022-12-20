import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateOptionDto {
	@ApiProperty({
		description: 'Sentence of option',
	})
	@IsOptional()
	@IsString()
	readonly sentence: string;
	@ApiProperty({
		description: 'Defines if the option is correct [true] or wrong [false]',
	})
	@IsOptional()
	@IsBoolean()
	readonly correct: boolean;
	@ApiProperty({
		description:
			'Use an identifier for the option, it can be a letter [For example for multiple choice questions: A,B,C,D...] [Also for example true or false questions: F, V] or it can be a number [1,2,3,4...]',
	})
	@IsOptional()
	@IsString()
	readonly identifier: string;
	@ApiProperty({
		description: 'Question id of option',
	})
	@IsOptional()
	@IsInt()
	readonly questionId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the option is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
