import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryGroupDto {
	@ApiProperty({
		description: 'Search group using name',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Search group using course id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;
	@ApiProperty({
		description: 'Institute id of group',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Search group if exist or not',
		required: false,
	})
	@IsOptional()
	@ApiProperty({
		description: 'Period of the group',
	})
	@IsInt()
	@Type(() => Number)
	readonly periodId: number;
	@IsOptional()
	@ApiProperty({
		description: 'Year of the group',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly year: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist: boolean;
}
