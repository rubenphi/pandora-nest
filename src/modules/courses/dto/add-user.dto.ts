import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/modules/auth/roles.decorator';

export class AddUserToCourseDto {
	@ApiProperty()
	@IsNumber()
	userId: number;

	@ApiProperty()
	@IsString()
	rol: Role;

	@ApiProperty()
	@IsNumber()
	year: number;

	@ApiProperty({ required: false, default: true })
	@IsBoolean()
	@IsOptional()
	active: boolean;
}
