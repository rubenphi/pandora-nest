import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateAreaDto {
	@IsNotEmpty()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
