import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';

export enum AssignmentType {
	COURSE = 'COURSE',
	GROUP = 'GROUP',
}

export class DeactivateUserAssignmentsDto {
	@ApiProperty({
		enum: AssignmentType,
		isArray: true,
		description:
			'Array of assignment types to deactivate (e.g., ["COURSE", "GROUP"])',
	})
	@IsArray()
	@IsEnum(AssignmentType, { each: true })
	readonly assignmentTypes: AssignmentType[];
}
