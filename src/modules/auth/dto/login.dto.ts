import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
	@ApiProperty({
		description: 'Insert Code user',
	})
	@IsString()
	readonly code: string;
	@ApiProperty({
		description: 'Insert Password',
	})
	@IsString()
	readonly password: string;
}
