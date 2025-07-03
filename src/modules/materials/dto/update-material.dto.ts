import {
	IsString,
	IsEnum,
	IsOptional,
	IsNumber,
	IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../material.entity';

export class UpdateMaterialDto {
	@ApiProperty({
		description: 'Title of the material',
		example: 'My Updated Material',
		required: false,
	})
	@IsString()
	@IsOptional()
	title?: string;

	@ApiProperty({
		enum: MaterialType,
		description: 'Type of the material',
		example: MaterialType.PDF,
		required: false,
	})
	@IsEnum(MaterialType)
	@IsOptional()
	type?: MaterialType;

	@ApiProperty({
		description: 'URL of the material (if applicable)',
		example: 'uploads/my-updated-doc.pdf',
		required: false,
	})
	@IsString()
	@IsOptional()
	url?: string;

	@ApiProperty({
		description: 'Content of the material (if text-based)',
		example: '<p>Updated content</p>',
		required: false,
	})
	@IsString()
	@IsOptional()
	content?: string;

	@ApiProperty({
		description: 'ID of the lesson associated with the material',
		example: 1,
		required: false,
	})
	@IsNumber()
	@IsOptional()
	lessonId?: number;

	@ApiProperty({
		description: 'ID of the institute associated with the material',
		example: 1,
		required: false,
	})
	@IsNumber()
	@IsOptional()
	instituteId?: number;

	@ApiProperty({
		description: 'Indicates if the material exists',
		example: true,
		required: false,
	})
	@IsBoolean()
	@IsOptional()
	exist?: boolean;
}
