import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateAreaDto {
	@ApiProperty({
		description: 'Area´s name',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of area',
	})
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the area is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
