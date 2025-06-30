import { IsEnum, IsInt, IsUUID } from 'class-validator';
import { ContentType } from '../lesson-item.entity';

export class CreateLessonItemDto {
	@IsInt()
	lessonId: number;

	@IsEnum(ContentType)
	contentType: ContentType;

	@IsInt()
	contentId: number;
}
