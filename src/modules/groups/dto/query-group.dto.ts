import { Type, Transform } from 'class-transformer';
import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateGroupDto {
	@IsOptional()
	@IsString()
	readonly name?: string;
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	readonly courseId?: number;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	  })
	@IsBoolean()
	readonly exist: boolean;
}
