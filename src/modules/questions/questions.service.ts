import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

import { Question } from './question.entity';
import { CreateQuestionDto, UpdateQuestionDto } from './dto';
import { Lesson } from '../lessons/lesson.entity';

@Injectable()
export class QuestionsService {
	constructor(
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
	) {}

	async getQuestions(): Promise<Question[]> {
		return await this.questionRepository.find({ relations: ['lesson'] });
	}
	async getQuestion(id: number): Promise<Question> {
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: id },
				relations: ['lesson', 'options'],
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		return question;
	}
	async createQuestion(questionDto: CreateQuestionDto): Promise<Question> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: questionDto.lesson_id },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		const question: Question = await this.questionRepository.create({
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson: lesson,
			points: questionDto.points,
			photo: questionDto.photo,
			visible: questionDto.visible,
			available: questionDto.available,
			exist: questionDto.exist,
		});
		return this.questionRepository.save(question);
	}
	async updateQuestion(
		id: number,
		questionDto: UpdateQuestionDto,
	): Promise<Question> {
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: questionDto.lesson_id },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});
		const imageUrl = await (
			await this.questionRepository.findOneOrFail({ where: { id: id } })
		).photo;
		const question: Question = await this.questionRepository.preload({
			id: id,
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson: lesson,
			points: questionDto.points,
			photo: questionDto.photo,
			visible: questionDto.visible,
			available: questionDto.available,
			exist: questionDto.exist,
		});
		if (!question) {
			throw new NotFoundException(
				'The question you want to update does not exist',
			);
		} else if (question && !question.photo && imageUrl) {
			fs.unlinkSync(imageUrl);
		}
		return this.questionRepository.save(question);
	}

	async deleteQuestion(id: number): Promise<void> {
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The question you want to delete does not exist',
				);
			});
		if (question.photo) {
			fs.unlinkSync(question.photo);
		}
		this.questionRepository.remove(question);
	}
}
