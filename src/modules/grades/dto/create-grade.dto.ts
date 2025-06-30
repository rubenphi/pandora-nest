import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class CreateGradeDto {
	@ApiProperty({
		type: Number,
		nullable: false,
		description: 'User to add Id',
	})
	@IsInt()
	readonly userId: number;
	@ApiProperty({
		type: Number,
		nullable: false,
		description: 'Quiz to add Id',
	})
	@IsInt()
	readonly quizId: number;
	@ApiProperty({
		type: Number,
		nullable: false,
		description: 'Period to add Id',
	})
	@IsInt()
	readonly periodId: number;
	@ApiProperty({
		type: Number,
		nullable: false,
		description: 'Grade',
	})
	@IsNumber()
	readonly grade: number;
	@ApiProperty({
		type: Number,
		nullable: false,
		description: 'Institute to add Id',
	})
	@IsInt()
	readonly instituteId: number;
}
