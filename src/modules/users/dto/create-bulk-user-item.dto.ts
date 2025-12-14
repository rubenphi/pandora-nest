import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { CreateUserDto } from './create-users.dto';

export class CreateBulkUserItemDto extends CreateUserDto {
	@ApiProperty({
		description: 'Course name from Excel (optional)',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly cuurse?: string;

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
	@IsIn(['student', 'teacher'], { message: 'System role must be student or teacher' })
	readonly systemRol: string;
}
