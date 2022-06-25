import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ImportFromQuestionDto {
	@ApiProperty({
		description:
			'Indicate the id of the question from which you are going to import the options',
	})
	@IsInt()
	readonly fromQuestionId: number;
}
