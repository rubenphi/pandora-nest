import { IsNotEmpty, IsInt, IsBoolean } from 'class-validator';

export class UpdateGroupDto {
	@IsNotEmpty()
	readonly name: string;
	@IsInt()
	readonly courseId: number;
	@IsBoolean()
	readonly exist: boolean;
}
