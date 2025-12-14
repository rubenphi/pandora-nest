import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, IsIn } from 'class-validator';
import { CreateUserDto } from './create-users.dto';
import { Type } from 'class-transformer';

export class CreateBulkUserItemDto extends CreateUserDto {
	@ApiProperty({
		description: 'Course ID for assignment (optional)',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;

	@ApiProperty({
		description: 'Role in course from Excel (optional)',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly rolEnCurso?: string;

	@ApiProperty({
		description: 'System role of user (student or teacher) from Excel',
		enum: ['student', 'teacher'],
	})
	@IsString()
	@IsIn(['student', 'teacher'], {
		message: 'System role must be student or teacher',
	})
	readonly systemRol: string;
}
