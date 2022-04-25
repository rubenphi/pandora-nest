import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class QueryLessonDto {
	@IsOptional()
	@IsString()
	readonly theme?: string;
	@IsOptional()
	@Type(() => Date)
	@IsDateString()
	readonly date?: Date;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly areaId?: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist?: boolean;
}
