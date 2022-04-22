import { IsInt } from 'class-validator';

export class DeleteAreaFromCourseDto {
	@IsInt()
	readonly courseId: number;
	@IsInt()
	readonly areaId: number;
}
