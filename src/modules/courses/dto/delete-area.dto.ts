import { ApiProperty } from '@nestjs/swagger';
import {  IsInt } from 'class-validator';

export class DeleteAreaFromCourseDto {
	@ApiProperty({
		description: 'Areas to delete Id',
		type: [Number]
	})
	@IsInt({each:true})
	readonly areasId: number[];
}
}
