import { Transform } from 'class-transformer';
import {
	IsString,
	IsEmail,
	IsBoolean,
	IsOptional,
	ValidateIf,
} from 'class-validator';

export class QueryUserDto {
	@IsOptional()
	@IsString()
	readonly name?: string;
	@IsOptional()
	@IsString()
	readonly lastName?: string;
	@IsOptional()
	@ValidateIf((o) => o.email != '')
	@IsEmail()
	readonly email?: string;
	@IsOptional()
	@IsString()
	readonly code?: string;
	@IsOptional()
	@Transform(({ value }) => {
		return [true, 'enabled', 'true'].indexOf(value) > -1;
	})
	@IsBoolean()
	readonly exist?: boolean;
}
