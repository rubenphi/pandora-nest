import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean } from 'class-validator';

export class CreateInstituteDto {
	@ApiProperty({
		description: 'Institute´s name',
	})
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the institute is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
