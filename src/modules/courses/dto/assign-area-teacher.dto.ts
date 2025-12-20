import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAreaTeacherDto {
	@ApiProperty()
	@IsNumber()
	areaId: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	teacherId?: number;

	@ApiProperty({ default: true })
	@IsOptional()
	active?: boolean;
}
