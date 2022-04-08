import { IsString, IsInt, IsBoolean } from 'class-validator';

export class CreateGroupDto {
	@IsString()
	readonly name: string;
	@IsInt()
	readonly course_id: number;
	@IsBoolean()
	readonly exist: boolean;
}
