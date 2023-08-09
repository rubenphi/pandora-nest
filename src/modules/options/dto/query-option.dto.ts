import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryOptionDto {
	@ApiProperty({
		description: 'Search option using a word or phrase in the sentence',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly sentence?: string;
	@ApiProperty({
		description: 'Search option if it is correct or not.',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly correct?: boolean;
	@ApiProperty({
		description: 'Search option using a identifier',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly identifier?: string;
	@ApiProperty({
		description: 'Search option using a question id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly questionId?: number;
	@ApiProperty({
		description: 'Institute id of option',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Search option if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
