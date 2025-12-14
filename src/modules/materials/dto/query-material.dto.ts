import { IsOptional, IsNumberString } from 'class-validator';

export class QueryMaterialDto {
	@IsOptional()
	@IsNumberString()
	lessonId?: string;

	@IsOptional()
	@IsNumberString()
	courseId?: string;

	@IsOptional()
	@IsNumberString()
	areaId?: string;

	@IsOptional()
	@IsNumberString()
	instituteId?: string;
}
