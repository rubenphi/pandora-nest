import { IsString, IsBoolean, IsInt } from 'class-validator';

export class CreateCourseDto {
	@IsString()
	readonly name: string;
	@IsInt()
	readonly year: number;
	@IsBoolean()
	readonly exist: boolean;
}
