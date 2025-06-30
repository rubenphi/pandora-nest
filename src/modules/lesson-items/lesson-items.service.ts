import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonItem } from './lesson-item.entity';

import { CreateLessonItemDto } from './dto/create-lesson-item.dto';
import { Lesson } from '../lessons/lesson.entity';

@Injectable()
export class LessonItemsService {
	constructor(
		@InjectRepository(LessonItem)
		private readonly lessonItemRepository: Repository<LessonItem>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
	) {}

	async create(createLessonItemDto: CreateLessonItemDto): Promise<LessonItem> {
		const { lessonId, contentType, contentId } = createLessonItemDto;

		const lesson = await this.lessonRepository.findOne({
			where: { id: lessonId },
		});

		if (!lesson) {
			throw new Error('Lesson not found');
		}

		const order =
			(await this.lessonItemRepository.count({ where: { lesson } })) + 1;

		const newLessonItem = this.lessonItemRepository.create({
			lesson,
			contentType,
			contentId,
			order,
		});

		return this.lessonItemRepository.save(newLessonItem);
	}
}
