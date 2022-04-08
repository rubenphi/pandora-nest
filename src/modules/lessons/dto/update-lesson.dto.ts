import { IsString, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
	@IsString()
	readonly theme: string;
	@IsDateString()
	readonly date: Date;
	@IsInt()
	readonly course_id: number;
	@IsBoolean()
	readonly exist: boolean;
}
