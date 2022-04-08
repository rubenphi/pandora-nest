import { IsString, IsBoolean } from 'class-validator';

export class CreateCourseDto {
	@IsString()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
