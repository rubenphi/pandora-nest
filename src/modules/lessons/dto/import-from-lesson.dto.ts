import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ImportFromLessonDto {
	@ApiProperty({
		description:
			'Indicate the id of the lesson from which you are going to import the questions',
	})
	@IsInt()
	readonly fromLessonId: number;
}
