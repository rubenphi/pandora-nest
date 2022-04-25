import { IsInt, IsArray } from 'class-validator';

export class AddAreaToCourseDto {
	@IsArray()
	readonly areasId: number[];
}
