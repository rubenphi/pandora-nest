import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsIn } from 'class-validator';
import { GRADABLE_ENTITIES } from '../../grades/grade.entity';

export class CreateReinforcementDto {
	@ApiProperty({ description: 'Student Id' })
	@IsInt()
	readonly studentId: number;

	@ApiProperty({ description: 'Teacher Id' })
	@IsInt()
	readonly teacherId: number;

	@ApiProperty({ description: 'Area Id' })
	@IsInt()
	readonly areaId: number;

	@ApiProperty({ description: 'Grade' })
	@IsNumber()
	readonly grade: number;

	@ApiProperty({ description: 'Year' })
	@IsInt()
	readonly year: number;

	@ApiProperty({ description: 'Period Id' })
	@IsInt()
	readonly periodId: number;

	@ApiProperty({ description: 'Course Id' })
	@IsInt()
	readonly courseId: number;

	@ApiProperty({ description: 'Gradable Items' })
	@IsOptional()
	readonly gradableItems: { id: number; type: string }[];
}
