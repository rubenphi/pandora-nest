import {
	IsString,
	IsNotEmpty,
	IsEnum,
	IsOptional,
	IsNumber,
	IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MaterialType } from '../material.entity';

export class CreateMaterialDto {
	@ApiProperty({
		description: 'Title of the material',
		example: 'My Awesome Material',
	})
	@IsString()
	@IsNotEmpty()
	title: string;

	@ApiProperty({
		enum: MaterialType,
		description: 'Type of the material',
		example: MaterialType.VIDEO,
	})
	@IsEnum(MaterialType)
	@IsNotEmpty()
	type: MaterialType;

	@ApiProperty({
		description: 'URL of the material (if applicable)',
		example: 'uploads/my-video.mp4',
		required: false,
	})
	@IsString()
	@IsOptional()
	url?: string;

	@ApiProperty({
		description: 'Content of the material (if text-based)',
		example: '<h1>Hello World!</h1>',
		required: false,
	})
	@IsString()
	@IsOptional()
	content?: string;

	@ApiProperty({
		description: 'ID of the lesson associated with the material',
		example: 1,
	})
	@IsNumber()
	@IsNotEmpty()
	lessonId: number;

	@ApiProperty({
		description: 'ID of the institute associated with the material',
		example: 1,
	})
	@IsNumber()
	@IsNotEmpty()
	instituteId: number;

	@ApiProperty({
		description: 'Indicates if the material exists',
		example: true,
	})
	@IsBoolean()
	@IsNotEmpty()
	exist: boolean;
}
