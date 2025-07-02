
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ImportFromQuizDto {
	@ApiProperty({
		description:
			'Indicate the id of the quiz from which you are going to import the questions',
	})
	@IsInt()
	readonly fromQuizId: number;
}
