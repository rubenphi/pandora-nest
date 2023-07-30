import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateOptionDto {
	@ApiProperty({
		description: 'Sentence of option',
	})
	@IsString()
	readonly sentence: string;
	@ApiProperty({
		description: 'Defines if the option is correct [true] or wrong [false]',
	})
	@IsBoolean()
	readonly correct: boolean;
	@ApiProperty({
		description:
			'Use an identifier for the option, it can be a letter [For example for multiple choice questions: A,B,C,D...] [Also for example true or false questions: F, V] or it can be a number [1,2,3,4...]',
	})
	@IsString()
	readonly identifier: string;
	@ApiProperty({
		description: 'Question id of option',
	})
	@IsInt()
	readonly questionId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the option is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
