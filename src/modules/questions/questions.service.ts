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
import { Role } from '../auth/roles.decorator';

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
					institute: { id: queryQuestion.instituteId },
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
				relations: ['lesson', 'institute', 'options'],
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		return question;
	}
	async createQuestion(
		questionDto: CreateQuestionDto,
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

		if (user.id !== lesson.author.id) {
			throw new ForbiddenException('You are not the author of this lesson');
		}
		const question: Question = await this.questionRepository.create({
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson,
			institute,
			points: questionDto.points,
			photo: questionDto.photo == 'null' ? null : questionDto.photo,
			visible: questionDto.visible,
			available: questionDto.available,
			exist: questionDto.exist,
		});

		console.log(question.id);

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
		if (user.id !== lesson.author.id) {
			throw new ForbiddenException('You are not the author of this lesson');
		}
		const imageUrl = await (
			await this.questionRepository.findOne({ where: { id } })
		).photo;

		const imagePath = imageUrl ? imageUrl.replace('files/', '') : '';
		const question: Question = await this.questionRepository.preload({
			id,
			title: questionDto.title,
			sentence: questionDto.sentence,
			lesson,
			institute,
			points: questionDto.points,
			photo: questionDto.photo == 'null' ? null : questionDto.photo,
			visible: questionDto.visible,
			available: questionDto.available,
			exist: questionDto.exist,
		});

		if (!question) {
			throw new NotFoundException(
				'The question you want to update does not exist',
			);
		} else if (
			(!question.photo || question.photo !== imageUrl) &&
			imageUrl &&
			fs.existsSync(imagePath) &&
			!(await this.questionRepository.findOne({
				where: { id: Not(id), photo: imageUrl },
			}))
		) {
			fs.unlinkSync(imagePath);
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
		const imagePath = question.photo
			? question.photo.replace('files/', '')
			: '';
		if (
			question.photo &&
			!(await this.questionRepository.findOne({
				where: { id: Not(id), photo: imagePath },
			}))
		) {
			fs.unlinkSync(imagePath);
		}
		this.questionRepository.remove(question);
	}

	async getOptionsByQuestion(
		id: number,
		user: User,
	): Promise<Partial<Option>[]> {
		const question: Question = await this.questionRepository
			.findOneOrFail({
				relations: ['options'],
				where: { id },
				order: { options: { identifier: 'asc' } },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});

		let response: Partial<Option>[] = question.options;
		if (user.rol == Role.Student) {
			response = response.map((option) => {
				delete option.correct;
				return option;
			});
		}
		return response;
	}

	async getAnswersByQuestion(id: number, user: User): Promise<Answer[]> {
		function comparar(objetoA, objetoB) {
			if (objetoA.points > objetoB.points) {
				return -1; // Si el puntaje de A es mayor, A va antes
			} else if (objetoA.points < objetoB.points) {
				return 1; // Si el puntaje de B es mayor, B va antes
			} else {
				// Si los puntajes son iguales, ordena por fecha ascendente
				if (objetoA.createdAt < objetoB.createdAt) {
					return -1; // A va antes si su fecha es menor
				} else if (objetoA.createdAt > objetoB.createdAt) {
					return 1; // B va antes si su fecha es menor
				} else {
					return 0; // Si son iguales, no se cambian de posición
				}
			}
		}
		const question: Question = await this.questionRepository
			.findOneOrFail({
				relations: ['answers', 'answers.option', 'answers.group', 'institute'],
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		if (user.institute.id !== question.institute.id) {
			throw new ForbiddenException('You are not allowed to see this question');
		}
		//order Answers by created (DESC) and points (ASC)
		return question.answers.sort(comparar);
	}

	async importOptionsToQuestion(
		id: number,
		ImportFromQuestionDto: ImportFromQuestionDto,
	): Promise<Option[]> {
		const fromQuestion: Question = await this.questionRepository
			.findOneOrFail({
				relations: ['options', 'options.institute'],
				where: { id: ImportFromQuestionDto.fromQuestionId },
			})
			.catch(() => {
				throw new NotFoundException('Question origin not found');
			});

		const toQuestion: Question = await this.questionRepository
			.findOneOrFail({ relations: ['options', 'institute'], where: { id } })
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
					institute: toQuestion.institute,
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
