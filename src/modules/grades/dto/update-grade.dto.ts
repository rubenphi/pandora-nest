import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber } from 'class-validator';

export class UpdateGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to add Id',
	})
	@IsInt()
	readonly userId: number;
	@ApiProperty({
		type: Number,
		description: 'Quiz to add Id',
	})
	@IsInt()
	readonly quizId: number;
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
	@ApiProperty({
		type: Boolean,
		description: 'Exist',
	})
	@IsBoolean()
	readonly exist: boolean;
}
