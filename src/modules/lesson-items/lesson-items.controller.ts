import { Body, Controller, Post } from '@nestjs/common';
import { CreateLessonItemDto } from './dto/create-lesson-item.dto';
import { LessonItemsService } from './lesson-items.service';

@Controller('lesson-items')
export class LessonItemsController {
	constructor(private readonly lessonItemsService: LessonItemsService) {}

	@Post()
	create(@Body() createLessonItemDto: CreateLessonItemDto) {
		return this.lessonItemsService.create(createLessonItemDto);
	}
}
