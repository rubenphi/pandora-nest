import { Type, Transform } from 'class-transformer';
import {
	IsString,
	IsInt,
	IsBoolean,
	IsOptional,
} from 'class-validator';


export class CreateQuestionDto {
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
	readonly lessonId: number;
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
