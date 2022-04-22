import { IsInt } from 'class-validator';

export class AddAreaToCourseDto {
	@IsInt()
	readonly courseId: number;
	@IsInt()
	readonly areaId: number;
}
