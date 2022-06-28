import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class UpdateInstituteDto {
	@ApiProperty({
		description: 'Institute´s name',
	})
	@IsOptional()
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the institute is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
