import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryStudentCriterionPermissionDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	reviserId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@IsNumber()
	@Type(() => Number)
	revisedId?: number;

	@ApiProperty({
		type: String,
		description: 'Type of reviser',
		required: false,
		enum: ['Group', 'User'],
	})
	@IsOptional()
	reviserType?: 'Group' | 'User';

	@ApiProperty({
		type: String,
		description: 'Type of revised',
		required: false,
		enum: ['Group', 'User'],
	})
	@IsOptional()
	revisedType?: 'Group' | 'User';
	@ApiProperty({ required: false })
	@IsOptional()
	@IsBoolean()
	@Type(() => Number)
	expired?: boolean;
}
