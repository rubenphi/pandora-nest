import { ApiProperty } from '@nestjs/swagger';
import {
	IsIn,
	IsInt,
	IsNumber,
	IsString,
	IsOptional,
	IsBoolean,
} from 'class-validator';
import { GRADABLE_ENTITIES } from '../grade.entity';

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
		description: 'ID of the gradable item (e.g., Quiz ID, Activity ID)',
	})
	@IsInt()
	readonly gradableId: number;

	@ApiProperty({
		type: String,
		nullable: false,
		description: `Type of the gradable item. Allowed values: ${GRADABLE_ENTITIES.join(
			', ',
		)}`,
		enum: GRADABLE_ENTITIES,
	})
	@IsString()
	@IsIn(GRADABLE_ENTITIES)
	readonly gradableType: string;

	@ApiProperty({
		type: String,
		description: 'Type of the grade (regular or support)',
		enum: ['regular', 'support'],
		default: 'regular',
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsIn(['regular', 'support'])
	readonly gradeType?: 'regular' | 'support';

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

	@ApiProperty({
		type: Boolean,
		description: 'Existence status',
		default: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	readonly exist?: boolean;
}
