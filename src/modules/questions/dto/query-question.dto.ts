import { Type, Transform } from 'class-transformer';
import {
	IsString,
	IsInt,
	IsBoolean,
	IsOptional,
} from 'class-validator';


export class QueryQuestionDto {
	@IsOptional()
	@IsString()
	readonly title?: string;
	@IsOptional()
	@IsString()
	readonly sentence?: string;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly points?: number;
	@IsOptional()
	photo?: string;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly visible?: boolean;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly available?: boolean;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId?: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist?: boolean;
}
