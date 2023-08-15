import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';
import * as fs from 'fs';

import { Question } from './question.entity';
import {
	CreateQuestionDto,
	UpdateQuestionDto,
	ImportFromQuestionDto,
	QueryQuestionDto,
} from './dto';
import { Lesson } from '../lessons/lesson.entity';
import { Option } from '../options/option.entity';
import { Answer } from '../answers/answer.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';

@Injectable()
export class QuestionsService {
	constructor(
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getQuestions(queryQuestion: QueryQuestionDto): Promise<Question[]> {
		if (queryQuestion) {
			return await this.questionRepository.find({
				where: {
					title: queryQuestion.title ? ILike(`%${queryQuestion.title}%`) : null,
					sentence: queryQuestion.title
						? ILike(`%${queryQuestion.sentence}%`)
						: null,
					points: queryQuestion.points,
					photo: queryQuestion.photo,
					visible: queryQuestion.visible,
					available: queryQuestion.available,
					lesson: { id: queryQuestion.lessonId },
					exist: queryQuestion.exist,
					institute: { id: queryQuestion.instituteId }
				},
				relations: ['lesson', 'institute'],
			});
		} else {
			return await this.questionRepository.find({
				relations: ['lesson', 'institute'],
			});
		}
	}
	async getQuestion(id: number): Promise<Question> {
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id },
				relations: ['lesson', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		return question;
	}
	async createQuestion(questionDto: CreateQuestionDto, user: User): Promise<Question> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: questionDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: questionDto.lessonId },
				relations: ['author'],
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});

			if(user.id !== lesson.author.id){
				throw new ForbiddenException('You are not the author of this lesson')
			}
		const question: Question = await this.questionRepository.create({
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson,
			institute,
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
		user: User,
	): Promise<Question> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: questionDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: questionDto.lessonId },
				relations: ['author'],
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
			if(user.id !== lesson.author.id){
				throw new ForbiddenException('You are not the author of this lesson')
			}
		const imageUrl = await (
			await this.questionRepository.findOne({ where: { id } })
		).photo;
		const question: Question = await this.questionRepository.preload({
			id,
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson,
			institute,
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
		} else if (
			question &&
			!question.photo &&
			imageUrl &&
			fs.existsSync(imageUrl) &&
			!(await this.questionRepository.findOne({
				where: { id: Not(id), photo: question.photo },
			}))
		) {
			fs.unlinkSync(imageUrl);
		}
		return this.questionRepository.save(question);
	}

	async deleteQuestion(id: number): Promise<void> {
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The question you want to delete does not exist',
				);
			});
		if (
			question.photo &&
			!(await this.questionRepository.findOne({
				where: { id: Not(id), photo: question.photo },
			}))
		) {
			fs.unlinkSync(question.photo);
		}
		this.questionRepository.remove(question);
	}

	async getOptionsByQuestion(id): Promise<Option[]> {
		const question: Question = await this.questionRepository
			.findOneOrFail({ relations: ['options'], where: { id },order: {options: {identifier: 'asc'}} })
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		return question.options;
	}

	async getAnswersByQuestion(id: number, user: User): Promise<Answer[]> {
		const question: Question = await this.questionRepository
			.findOneOrFail({ relations: ['answers'], where: { id } })
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
			if(user.institute.id !== question.institute.id){
				throw new ForbiddenException('You are not allowed to see this question')
			}
		return question.answers;
	}

	async importOptionsToQuestion(
		id: number,
		ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Option[]> {
		const fromQuestion: Question = await this.questionRepository
			.findOneOrFail({
				relations: ['options'],
				where: { id: ImportFromQuestionDto.fromQuestionId },
			})
			.catch(() => {
				throw new NotFoundException('Question origin not found');
			});

		const toQuestion: Question = await this.questionRepository
			.findOneOrFail({ relations: ['options'], where: { id } })
			.catch(() => {
				throw new NotFoundException('Question destiny not found');
			});

		if (toQuestion.options.length) {
			throw new BadRequestException(
				`You can only import options to a question that doesn't have them`,
			);
		} else {
			for (const option of fromQuestion.options) {
				const optionToSave: Option = this.optionRepository.create({
					sentence: option.sentence,
					correct: option.correct,
					identifier: option.identifier,
					question: toQuestion,
					exist: option.exist,
				});
				await this.optionRepository.save(optionToSave);
			}

			return (
				await this.questionRepository.findOne({
					relations: ['options.question'],
					where: { id },
				})
			).options;
		}
	}

	async importPhotoToQuestion(
		id: number,
		importFromQuestionDto: ImportFromQuestionDto,
	): Promise<Question> {
		const fromQuestion: Question = await this.questionRepository
			.findOneOrFail({ where: { id: importFromQuestionDto.fromQuestionId } })
			.catch(() => {
				throw new NotFoundException('Question origin not found');
			});

		const toQuestion: Question = await this.questionRepository
			.preload({
				id,
				photo: fromQuestion.photo,
			})
			.catch(() => {
				throw new NotFoundException(
					'The question you want to update does not exist',
				);
			});

		return this.questionRepository.save(toQuestion);
	}
}
