import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class CreateAreaDto {
	@ApiProperty({
		description: 'Area´s name',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the area is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
