import { Transform } from 'class-transformer';
import { IsString, IsEmail, IsBoolean, IsOptional } from 'class-validator';

export class QueryUserDto {
	@IsOptional()
	@IsString()
	readonly name?: string;
	@IsOptional()
	@IsString()
	readonly lastName: string;
	@IsOptional()
	@IsEmail()
	readonly email: string;
	@IsOptional()
	@IsString()
	readonly code: string;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
