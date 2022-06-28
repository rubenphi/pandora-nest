import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsInt, IsString } from 'class-validator';

export class UpdateAreaDto {
	@ApiProperty({
		description: 'Area´s name',
	})
	@IsOptional()
	@IsString()
	readonly name: string;
	@ApiProperty({
		description: 'Institute id of user',
	})
	@IsOptional()
	@IsInt()
	readonly instituteId: number;
	@ApiProperty({
		description: 'Indicates if the area is active or "deleted"',
	})
	@IsOptional()
	@IsBoolean()
	readonly exist: boolean;
}
