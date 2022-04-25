import { IsString, IsDateString, IsInt, IsBoolean } from 'class-validator';

export class UpdateLessonDto {
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
