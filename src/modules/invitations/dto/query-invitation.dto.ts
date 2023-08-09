import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {  IsInt, IsBoolean, IsOptional, IsISO8601, IsString } from 'class-validator';

export class QueryInvitationDto {
	@ApiProperty({
		description: 'Search initial date',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	readonly initialDate?: string;
	@ApiProperty({
		description: 'Search group using course id',
		required: false,
	})
	@ApiProperty({
		description: 'Search final date',
		required: false,
	})
	@IsOptional()
	@IsISO8601()
	readonly finalDate?: string;
	@ApiProperty({
		description: 'Institute id of invitation',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Invitation code',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly code: string;
	@ApiProperty({
		description: 'Invitation exist?',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist: boolean;
	@ApiProperty({
		description: 'Invitation was used?',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly active: boolean;
}
