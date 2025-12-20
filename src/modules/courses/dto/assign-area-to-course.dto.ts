import { IsNumber, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAreaToCourseDto {
	@ApiProperty()
	@IsNumber()
	areaId: number;

	@ApiProperty({ type: String, format: 'date' })
	@IsDateString()
	start_date: Date;

	@ApiProperty({ type: String, format: 'date', required: false })
	@IsOptional()
	@IsDateString()
	end_date?: Date;

	@ApiProperty({ default: true, required: false })
	@IsOptional()
	@IsBoolean()
	active?: boolean;
}
