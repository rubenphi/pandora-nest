import { IsNotEmpty, IsBoolean } from 'class-validator';

export class UpdateCourseDto {
	@IsNotEmpty()
	readonly name: string;
	@IsBoolean()
	readonly exist: boolean;
}
