import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsEnum, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryStudentCriterionPermissionDto {
	@ApiProperty({ required: false })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	reviserId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	revisedId?: number;

	@ApiProperty({ required: false })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	activityId?: number;

	@ApiProperty({
		type: String,
		description: 'Type of reviser',
		required: false,
		enum: ['Group', 'User'],
	})
	@IsOptional()
	@IsEnum(['Group', 'User'])
	reviserType?: 'Group' | 'User';

	@ApiProperty({
		type: String,
		description: 'Type of revised',
		required: false,
		enum: ['Group', 'User'],
	})
	@IsOptional()
	@IsEnum(['Group', 'User'])
	revisedType?: 'Group' | 'User';

	@ApiProperty({ required: false })
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	expired?: boolean;
}
