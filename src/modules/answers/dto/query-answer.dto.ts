import { Type, Transform } from 'class-transformer';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class QueryAnswerDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly optionId?: number;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly questionId?: number;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly groupId?: number;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly lessonId?: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
