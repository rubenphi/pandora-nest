import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryGroupDto {
	@ApiProperty({
		description: 'Search group using name',
		required: false
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Search group using course id',
		required: false
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;
	@ApiProperty({
		description: 'Search group if exist or not',
		required: false
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
