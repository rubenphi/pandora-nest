import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Answer } from './answer.entity';
import {
	CreateAnswerDto,
	UpdateAnswerDto,
	QueryAnswerDto,
	CreateBulkAnswersDto,
} from './dto';
import { Option } from '../options/option.entity';
import { Question } from '../questions/question.entity';
import { Group } from '../groups/group.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class AnswersService {
	constructor(
		@InjectRepository(Answer)
		private readonly answerRepository: Repository<Answer>,
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getAnswers(queryAnswer: QueryAnswerDto, user: User): Promise<Answer[]> {
		if (queryAnswer) {
			return await this.answerRepository.find({
				where: {
					option: { id: queryAnswer.optionId },
					question: {
						id: queryAnswer.questionId,
						quiz: {
							id: queryAnswer.quizId,
						},
					},
					group: { id: queryAnswer.groupId },
					user: { id: queryAnswer.userId },
					exist: queryAnswer.exist,
					institute: {
						id:
							user.rol == Role.Admin
								? queryAnswer.instituteId
								: user.institute.id,
					},
				},
				relations: [
					'option',
					'question',
					'question.quiz',
					'group',
					'user',
					'institute',
				],
			});
		} else {
			return await this.answerRepository.find({
				relations: [
					'option',
					'question',
					'question.quiz',
					'group',
					'user',
					'institute',
				],
			});
		}
	}

	async getAnswer(id: number, user: User): Promise<Answer> {
		const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'option',
					'question',
					'question.quiz',
					'group',
					'user',
					'institute',
				],
			})
			.catch(() => {
				throw new NotFoundException('Answer not found');
			});
		if (answer.institute.id !== user.institute.id) {
			throw new ForbiddenException('You are not allowed to see this answer');
		}
		return answer;
	}
	async createAnswer(answerDto: CreateAnswerDto, user: User): Promise<Answer> {
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== answerDto.instituteId
		) {
			throw new ForbiddenException('You are not allowed to create this answer');
		}

		let existingAnswerWhere: Answer | null = null;

		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id: answerDto.quizId },
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});

		let group: Group | undefined;
		let userEntity: User | undefined;

		if (quiz.quizType === 'individual') {
			if (!answerDto.userId) {
				throw new BadRequestException(
					'For individual quizzes, userId is required.',
				);
			}
			if (answerDto.groupId) {
				throw new BadRequestException(
					'For individual quizzes, groupId should not be provided.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({
					where: { id: answerDto.userId },
				})
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			existingAnswerWhere = await this.answerRepository.findOne({
				where: {
					question: { id: answerDto.questionId },

					user: { id: answerDto.userId },
					exist: true,
				},
			});
		} else if (quiz.quizType === 'group') {
			if (!answerDto.userId) {
				throw new BadRequestException('For group quizzes, userId is required.');
			}
			if (!answerDto.groupId) {
				throw new BadRequestException(
					'For group quizzes, groupId is required.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({
					where: { id: answerDto.userId },
				})
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			group = await this.groupRepository
				.findOneOrFail({
					where: { id: answerDto.groupId },
				})
				.catch(() => {
					throw new NotFoundException('Group not found');
				});

			existingAnswerWhere = await this.answerRepository.findOne({
				where: {
					question: { id: answerDto.questionId },

					group: { id: answerDto.groupId },

					exist: true,
				},
			});
		} else {
			throw new BadRequestException('Invalid quiz type.');
		}

		if (existingAnswerWhere) {
			throw new BadRequestException(
				'Esta pregunta ya fue respondida por este grupo o usuario en este quiz',
			);
		}

		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id: answerDto.optionId },
				relations: ['question'],
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: answerDto.questionId },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});

		if (!question.available || option.question.id !== question.id) {
			throw new ForbiddenException(
				'Debe esperar que la pregunta esté disponible',
			);
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: answerDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});

		const points: number = option.correct ? question.points : 0;
		const answer: Answer = await this.answerRepository.create({
			option,
			question,
			group,
			user: userEntity,
			points,
			quiz,
			institute,
			exist: answerDto.exist,
		});
		return this.answerRepository.save(answer);
	}

	async createBulkAnswers(
		bulkDto: CreateBulkAnswersDto,
		user: User,
	): Promise<Answer[]> {
		if (user.rol !== Role.Admin && user.institute.id !== bulkDto.instituteId) {
			throw new ForbiddenException(
				'You are not allowed to create answers here',
			);
		}

		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id: bulkDto.quizId },
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});

		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: bulkDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});

		let group: Group | undefined;
		let userEntity: User | undefined;
		const whereClause: any = { quiz: { id: bulkDto.quizId } };

		if (quiz.quizType === 'individual') {
			if (!bulkDto.userId) {
				throw new BadRequestException(
					'For individual quizzes, userId is required.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({ where: { id: bulkDto.userId } })
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			whereClause.user = { id: bulkDto.userId };
		} else if (quiz.quizType === 'group') {
			if (!bulkDto.userId) {
				throw new BadRequestException('For group quizzes, userId is required.');
			}
			if (!bulkDto.groupId) {
				throw new BadRequestException(
					'For group quizzes, groupId is required.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({ where: { id: bulkDto.userId } })
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			group = await this.groupRepository
				.findOneOrFail({ where: { id: bulkDto.groupId } })
				.catch(() => {
					throw new NotFoundException('Group not found');
				});
			whereClause.group = { id: bulkDto.groupId };
		} else {
			throw new BadRequestException('Invalid quiz type.');
		}

		const existingAnswers = await this.answerRepository.find({
			where: whereClause,
			relations: ['question', 'option'],
		});

		const answersToUpdate: Answer[] = [];
		const answersToCreate: Answer[] = [];

		for (const answerItem of bulkDto.answers) {
			const existingAnswer = existingAnswers.find(
				(a) => a.question.id === answerItem.questionId,
			);

			const question = await this.questionRepository
				.findOneOrFail({
					where: { id: answerItem.questionId },
				})
				.catch(() => {
					throw new NotFoundException(
						`Question with id ${answerItem.questionId} not found`,
					);
				});

			const option = await this.optionRepository
				.findOneOrFail({
					where: { id: answerItem.optionId, question: { id: question.id } },
				})
				.catch(() => {
					throw new NotFoundException(
						`Option with id ${answerItem.optionId} not found or does not belong to question ${question.id}`,
					);
				});

			const points = option.correct ? question.points : 0;

			if (existingAnswer) {
				// Update existing answer
				existingAnswer.option = option;
				existingAnswer.points = points;
				answersToUpdate.push(existingAnswer);
			} else {
				// Create new answer
				const newAnswer = this.answerRepository.create({
					option,
					question,
					quiz,
					institute,
					points,
					group: group,
					user: userEntity,
					exist: true,
				});
				answersToCreate.push(newAnswer);
			}
		}

		const savedAnswers = await this.answerRepository.save([
			...answersToCreate,
			...answersToUpdate,
		]);
		return savedAnswers;
	}

	async updateAnswer(
		id: number,
		answerDto: UpdateAnswerDto,
		user: User,
	): Promise<Answer> {
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== answerDto.instituteId
		) {
			throw new ForbiddenException('You are not allowed to update this answer');
		}
		const quiz: Quiz = await this.quizRepository
			.findOneOrFail({
				where: { id: answerDto.quizId },
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});

		let group: Group | undefined;
		let userEntity: User | undefined;
		const existingAnswerWhere: any = {
			question: { id: answerDto.questionId },
			quiz: { id: answerDto.quizId },
		};

		if (quiz.quizType === 'individual') {
			if (!answerDto.userId) {
				throw new BadRequestException(
					'For individual quizzes, userId is required.',
				);
			}
			if (answerDto.groupId) {
				throw new BadRequestException(
					'For individual quizzes, groupId should not be provided.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({
					where: { id: answerDto.userId },
				})
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			existingAnswerWhere.user = { id: answerDto.userId };
		} else if (quiz.quizType === 'group') {
			if (!answerDto.userId) {
				throw new BadRequestException('For group quizzes, userId is required.');
			}
			if (!answerDto.groupId) {
				throw new BadRequestException(
					'For group quizzes, groupId is required.',
				);
			}
			userEntity = await this.userRepository
				.findOneOrFail({
					where: { id: answerDto.userId },
				})
				.catch(() => {
					throw new NotFoundException('User not found');
				});
			group = await this.groupRepository
				.findOneOrFail({
					where: { id: answerDto.groupId },
				})
				.catch(() => {
					throw new NotFoundException('Group not found');
				});
			existingAnswerWhere.group = { id: answerDto.groupId };
		} else {
			throw new BadRequestException('Invalid quiz type.');
		}

		if (await this.answerRepository.findOne({ where: existingAnswerWhere })) {
			throw new BadRequestException(
				`Esta pregunta ya fue respondida por este ${
					quiz.quizType === 'individual' ? 'usuario' : 'grupo'
				} en este quiz.`,
			);
		}

		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id: answerDto.optionId },
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: answerDto.questionId },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: answerDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});

		const answer: Answer = await this.answerRepository.preload({
			id: id,
			option,
			question,
			group,
			user: userEntity,
			institute,
			exist: answerDto.exist,
		});
		answer.points = option.correct ? question.points : 0;
		if (!answer) {
			throw new NotFoundException(
				'The answer you want to update does not exist',
			);
		}
		return this.answerRepository.save(answer);
	}

	async deleteAnswer(id: number): Promise<void> {
		const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The answer you want to delete does not exist',
				);
			});
		this.answerRepository.remove(answer);
	}

	async bonusToAnswer(id: number, user: User): Promise<void> {
		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { question: { id: id }, correct: true },
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});

		const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { question: { id: id }, option: { id: option.id } },
				order: { id: 'ASC' },
				relations: ['institute', 'question'],
			})
			.catch(() => {
				throw new NotFoundException('Answer not found');
			});

		if (user.rol !== Role.Admin && user.institute.id !== answer.institute.id) {
			throw new ForbiddenException('You are not allowed to update this answer');
		}

		const answerUpdated: Answer = await this.answerRepository.preload({
			id: answer.id,
			points: answer.question.points * 1.01,
		});
		await this.answerRepository.save(answerUpdated);

		const questionUpdated: Question = await this.questionRepository.preload({
			id: id,
			available: false,
		});
		this.questionRepository.save(questionUpdated);

		if (!answer) {
			throw new NotFoundException(
				'The answer you want to update does not exist',
			);
		}
	}
}
