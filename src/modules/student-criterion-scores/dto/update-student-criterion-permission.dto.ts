import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateStudentCriterionPermissionDto } from './create-student-criterion-permission.dto';
import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateStudentCriterionPermissionDto extends PartialType(
	CreateStudentCriterionPermissionDto,
) {
	@ApiProperty({ required: true })
	@IsNumber()
	@IsNotEmpty()
	id: number;

	@ApiProperty({ required: false })
	@IsBoolean()
	@IsNotEmpty()
	expired?: boolean;
}
