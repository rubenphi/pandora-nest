import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryOptionDto {
	@IsOptional()
	@IsString()
	readonly sentence?: string;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly correct?: boolean;
	@IsOptional()
	@IsString()
	readonly identifier?: string;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly questionId?: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist?: boolean;
}
