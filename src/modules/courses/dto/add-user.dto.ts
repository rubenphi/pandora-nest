import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class AddUserToCourseDto {
	@ApiProperty({
		type: Number,
		description: 'User to add Id',
	})
	@IsInt({ each: true })
	readonly userId: number;
	@ApiProperty({
		type: Number,
		description: 'year',
	})
	@IsInt()
	readonly year: number;
	@ApiProperty({
		type: String,
		description: 'rol',
	})
	readonly rol: string;
}
