import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateQuestionDto {
	@ApiProperty({
		description: 'Title of question',
	})
	@IsOptional()
	@IsString()
	readonly title: string;
	@ApiProperty({
		description: 'Sentence of question',
	})
	@IsOptional()
	@IsString()
	readonly sentence: string;
	@ApiProperty({
		description: 'Score obtained for answering correctly',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly points: number;
	@ApiProperty({
		description: 'Photo of question',
		format: 'binary',
		required: false,
	})
	@IsOptional()
	@IsOptional()
	photo?: string | null;
	@ApiProperty({
		description: 'Indicates if the question is visible or not',
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsOptional()
	@IsBoolean()
	readonly visible: boolean;
	@ApiProperty({
		description: 'Indicates if the question is available to answer or not',
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsOptional()
	@IsBoolean()
	readonly available: boolean;
	@ApiProperty({
		description: 'Lesson id of question',
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the question is active or "deleted"',
	})
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
