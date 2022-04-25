import {  IsArray } from 'class-validator';

export class DeleteAreaFromCourseDto {
	@IsArray()
	readonly areasId: number[];
}
