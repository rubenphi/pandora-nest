import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudentCriterionPermissionDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsInt()
	reviserId: number;
	@ApiProperty()
	@IsNotEmpty()
	@IsInt()
	revisedId: number;
	@ApiProperty()
	@IsNotEmpty()
	@IsIn(['Group', 'User'])
	reviserType: 'Group' | 'User';
	@ApiProperty()
	@IsNotEmpty()
	@IsIn(['Group', 'User'])
	revisedType: 'Group' | 'User';
	@ApiProperty()
	@IsNotEmpty()
	@IsInt()
	activityId: number;
	@ApiProperty()
	@IsNotEmpty()
	expired: boolean;
}
