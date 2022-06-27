import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateInstituteDto {
	@ApiProperty({
		description: 'Institute´s name',
	})
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the institute is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
