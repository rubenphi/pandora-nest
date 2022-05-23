import { Type, Transform } from 'class-transformer';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class QueryUserDto {
	@IsOptional()
	@IsString()
	readonly name?: string;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
