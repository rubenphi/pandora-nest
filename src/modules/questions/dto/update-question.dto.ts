import { Type, Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateQuestionDto {
	@IsString()
	readonly title: string;
	@IsString()
	readonly sentence: string;
	@Type(() => Number)
	@IsInt()
	readonly points: number;
	@IsOptional()
	photo?: string;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly visible: boolean;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly available: boolean;
	@Type(() => Number)
	@IsInt()
	readonly lesson_id: number;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
