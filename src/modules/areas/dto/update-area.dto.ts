import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateAreaDto {
	@ApiProperty({
		description: 'Area´s name',
	})
	@IsNotEmpty()
	readonly name: string;
	@ApiProperty({
		description: 'Indicates if the area is active or "deleted"',
	})
	@IsBoolean()
	readonly exist: boolean;
}
