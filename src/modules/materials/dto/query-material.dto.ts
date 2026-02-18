import { IsOptional, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryMaterialDto {
	@ApiProperty({
		description: 'Search material using lesson id',
		required: false,
	})
	@IsOptional()
	@IsNumberString()
	lessonId?: string;

	@ApiProperty({
		description: 'Search material using course id',
		required: false,
	})
	@IsOptional()
	@IsNumberString()
	courseId?: string;

	@ApiProperty({
		description: 'Search material using area id',
		required: false,
	})
	@IsOptional()
	@IsNumberString()
	areaId?: string;

	@ApiProperty({
		description: 'Search material using institute id',
		required: false,
	})
	@IsOptional()
	@IsNumberString()
	instituteId?: string;

	@ApiProperty({
		description: 'Search material using title',
		required: false,
	})
	@IsOptional()
	title?: string;
}
