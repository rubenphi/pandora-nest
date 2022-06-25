import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryQuestionDto {
	@ApiProperty({
		description: 'Search question using a word or phrase in the title',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly title?: string;
	@ApiProperty({
		description: 'Search question using a word or phrase in the sentence',
		required: false,
	})
	@IsOptional()
	@IsString()
	readonly sentence?: string;
	@ApiProperty({
		description: 'Search question using the points in score',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly points?: number;
	@ApiProperty({
		description: 'Search question using the photo´s url',
		required: false,
	})
	@IsOptional()
	photo?: string;
	@IsOptional()
	@ApiProperty({
		description: 'Search the questions that are visible or not',
		required: false,
	})
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly visible?: boolean;
	@ApiProperty({
		description: 'Search the questions that are available or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly available?: boolean;
	@ApiProperty({
		description: 'Search the questions using the lesson´s id',
		required: false,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId?: number;
	@ApiProperty({
		description: 'Search the questions if exist or not',
		required: false,
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
