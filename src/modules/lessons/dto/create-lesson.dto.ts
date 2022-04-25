import { IsString, IsInt, IsBoolean, IsDateString } from 'class-validator';

export class CreateLessonDto {
	@IsString()
	readonly theme: string;
	@IsDateString()
	readonly date: Date;
	@IsInt()
	readonly courseId: number;
	@IsInt()
	readonly areaId: number;
	@IsBoolean()
	readonly exist: boolean;
}
