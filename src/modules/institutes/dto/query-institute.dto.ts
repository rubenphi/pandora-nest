import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class QueryInstituteDto {
	@ApiProperty({
		description: 'Search institute using a word or phrase in name',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly name?: string;
	@ApiProperty({
		description: 'Search institute if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
