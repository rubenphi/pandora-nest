import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Answer } from './answer.entity';
import { CreateAnswerDto, UpdateAnswerDto, QueryAnswerDto } from './dto';
import { Option } from '../options/option.entity';
import { Question } from '../questions/question.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
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
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getAnswers(queryAnswer: QueryAnswerDto, user: User): Promise<Answer[]> {
		if (queryAnswer) {
			return await this.answerRepository.find({
				where: {
					option: { id: queryAnswer.optionId },
					question: { id: queryAnswer.questionId },
					group: { id: queryAnswer.groupId },
					lesson: { id: queryAnswer.lessonId },
					exist: queryAnswer.exist,
					institute: {
						id:
							user.rol == Role.Admin
								? queryAnswer.instituteId
								: user.institute.id,
					},
				},
				relations: ['option', 'question', 'group', 'lesson', 'institute'],
			});
		} else {
			return await this.answerRepository.find({
				relations: ['option', 'question', 'group', 'lesson', 'institute'],
			});
		}
	}

	async getAnswer(id: number, user: User): Promise<Answer> {
		const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { id },
				relations: ['option', 'question', 'group', 'lesson', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Answer not found');
			});
		if (answer.institute.id !== user.institute.id) {
			throw new ForbiddenException('You are not allowed to see this answer');
		}
		if (user.rol === Role.Student) {
			const courseIndex = user.courses.findIndex(
				(assignment) => answer.lesson.course.id === assignment.course.id,
			);
			if (courseIndex === -1) {
				throw new ForbiddenException('You are not allowed to see this answer');
			}
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
		if (user.rol === Role.Student) {
			const groupIndex = user.groups.findIndex(
				(assignment) =>
					assignment.group.id === answerDto.groupId && assignment.group.active,
			);
			if (groupIndex === -1) {
				throw new NotFoundException(
					'You are not allowed to create this answer',
				);
			}
		}
		if (
			await this.answerRepository.findOne({
				where: {
					question: { id: answerDto.questionId },
					group: { id: answerDto.groupId },
				},
			})
		) {
			throw new BadRequestException('Este grupo ya respondió la pregunta');
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
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id: answerDto.groupId },
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: answerDto.lessonId },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
			});

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
			lesson,
			points,
			institute,
			exist: answerDto.exist,
		});
		return this.answerRepository.save(answer);
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
		if (
			await this.answerRepository.findOne({
				where: {
					question: { id: answerDto.questionId },
					group: { id: answerDto.groupId },
					id: Not(id),
				},
			})
		) {
			throw new BadRequestException(
				'This group already answered this question',
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
		const group: Group = await this.groupRepository
			.findOneOrFail({
				where: { id: answerDto.groupId },
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		const lesson: Lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: answerDto.lessonId },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
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
			lesson,
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
		console.log(answer);

		if (user.rol !== Role.Admin && user.institute.id !== answer.institute.id) {
			throw new ForbiddenException('You are not allowed to update this answer');
		}

		/* 	const answerUpdated: Answer = await this.answerRepository.preload({
			id: answer.id,
			points: answer.question.points * 1.5,
		});
 */
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
