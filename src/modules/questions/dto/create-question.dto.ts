import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateQuestionDto {
	@ApiProperty({
		description: 'Title of question',
	})
	@IsString()
	readonly title: string;
	@ApiProperty({
		description: 'Sentence of question',
	})
	@IsString()
	readonly sentence: string;
	@ApiProperty({
		description: 'Score obtained for answering correctly',
	})
	@Type(() => Number)
	@IsInt()
	readonly points: number;
	@ApiProperty({
		description: 'Photo of question',
		format: 'binary',
		required: false,
	})
	@IsOptional()
	photo?: string;
	@ApiProperty({
		description: 'Indicates if the question is visible or not',
	})
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly visible: boolean;
	@ApiProperty({
		description: 'Indicates if the question is available to answer or not',
	})
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly available: boolean;
	@ApiProperty({
		description: 'Lesson id of question',
	})
	@Type(() => Number)
	@IsInt()
	readonly lessonId: number;
	@ApiProperty({
		description: 'Institute id of question',
	})
	@Type(() => Number)
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the question is active or "deleted"',
	})
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist: boolean;
}
