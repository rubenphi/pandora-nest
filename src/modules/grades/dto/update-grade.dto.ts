import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsIn,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';
import { GRADABLE_ENTITIES } from '../grade.entity';

export class UpdateGradeDto {
	@ApiProperty({
		type: Number,
		description: 'User to add Id',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly userId?: number;

	@ApiProperty({
		type: Number,
		description: 'ID of the gradable item (e.g., Quiz ID, Activity ID)',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly gradableId?: number;

	@ApiProperty({
		type: String,
		description: `Type of the gradable item. Allowed values: ${GRADABLE_ENTITIES.join(
			', ',
		)}`,
		enum: GRADABLE_ENTITIES,
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsIn(GRADABLE_ENTITIES)
	readonly gradableType?: string;

	@ApiProperty({
		type: String,
		description: 'Type of the grade (regular or support)',
		enum: ['regular', 'support'],
		required: false,
	})
	@IsOptional()
	@IsString()
	@IsIn(['regular', 'support'])
	readonly gradeType?: 'regular' | 'support';

	@ApiProperty({
		type: Number,
		description: 'Period to add Id',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly periodId?: number;

	@ApiProperty({
		type: Number,
		description: 'Grade',
		required: false,
	})
	@IsOptional()
	@IsNumber()
	readonly grade?: number;

	@ApiProperty({
		type: Number,
		description: 'Institute to add Id',
		required: false,
	})
	@IsOptional()
	@IsInt()
	readonly instituteId?: number;

	@ApiProperty({
		type: Boolean,
		description: 'Exist',
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	readonly exist?: boolean;
}
