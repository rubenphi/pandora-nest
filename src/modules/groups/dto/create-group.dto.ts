import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateGroupDto {
	@IsString()
	readonly name: string;
	@IsInt()
	readonly courseId: number;
	@IsBoolean()
	readonly exist: boolean;
}
