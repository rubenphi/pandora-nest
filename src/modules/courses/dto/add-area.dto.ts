import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddAreaToCourseDto {
	@ApiProperty({
		type: [Number],
		description: 'Areas to add Id',
	})
	@IsInt({ each: true })
	readonly areasId: number[];
}
