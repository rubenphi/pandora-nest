import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreateGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to add Id',
	})
	@IsInt()
	readonly userId: number;
	@ApiProperty({
		type: Number,
		description: 'Lesson to add Id',
	})
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		type: Number,
		description: 'Period to add Id',
	})
	@IsInt()
	readonly periodId: number;
	@ApiProperty({
		type: Number,
		description: 'Grade',
	})
	@IsNumber()
	readonly grade: number;
	@ApiProperty({
		type: Number,
		description: 'Institute to add Id',
	})
	@IsInt()
	readonly instituteId: number;
}
