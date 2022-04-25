import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Answer } from './answer.entity';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';
import { Option } from '../options/option.entity';
import { Question } from '../questions/question.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';

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
	) {}

	async getAnswers(): Promise<Answer[]> {
		return await this.answerRepository.find({
			relations: ['option', 'question', 'group', 'lesson'],
		});
	}
	async getAnswersByLesson(id: number): Promise<Answer[]> {
		return await this.answerRepository
			.find({
				where: { lesson: { id: id} },relations: [
					'option',
					'question',
					'group',
					'lesson',
				],
			})
	}

	async bonusToAnswer(id: number): Promise<Answer> {
		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { question: { id: id},
			correct: true
			}
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});

			const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { question: {id :id}, option:{ id: option.id},
				
			},
			order: { id: 'ASC' }
			})
			.catch(() => {
				throw new NotFoundException('Answer not found');
			});

			
			const answerUpdated: Answer = await this.answerRepository.preload({
				id: answer.id,
				points: answer.points * 1.5,
			});

			const questionUpdated: Question = await this.questionRepository.preload({
				id: id,
				available: false,
			});
			this.questionRepository.save(questionUpdated)

			
			if (!answer) {
				throw new NotFoundException(
					'The answer you want to update does not exist',
				);
			}
			return this.answerRepository.save(answerUpdated);
			

	}

	async getAnswersByLessonSum(id: number): Promise<any> {
		const answers: Answer[] = await this.answerRepository
			.find({
				where: { lesson: { id: id} },relations: [
					'option',
					'question',
					'group',
					'lesson',
				],
			}).catch(() => {throw new NotFoundException('Lesson not found');})
			const suma = [];	
			answers.reduce( (res, value) =>  {
				if (!res[value.group.id]){
					res[value.group.id] = { group: value.group, points: 0};
					suma.push(res[value.group.id])
				}
				res[value.group.id].points += value.points;
				return res
			},{})
			return suma.sort(((a,b)=> b.points - a.points))
	}

	async getAnswersByQuestion(id: number): Promise<Answer[]> {
		return await this.answerRepository
			.find({
				where: { question: { id: id} },relations: [
					'option',
					'question',
					'group',
					'lesson',
				],
				order: {
					points: "DESC",
					createdAt: "ASC"
				}
			})
	}

	async getAnswer(id: number): Promise<Answer> {
		const answer: Answer = await this.answerRepository
			.findOneOrFail({
				where: { id },
				relations: [
					'option',
					'question',
					'group',
					'lesson',
				],
			})
			.catch(() => {
				throw new NotFoundException('Answer not found');
			});
		return answer;
	}
	async createAnswer(answerDto: CreateAnswerDto): Promise<Answer> {
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
				throw new NotFoundException(
					'Question not found',
				);
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

		const points: number = option.correct ? question.points : 0;
		const answer: Answer = await this.answerRepository.create({
		   	option,
			question,
			group,
			lesson,
			points,
			exist: answerDto.exist,
		});
		return this.answerRepository.save(answer);
	}
	async updateAnswer(
		id: number,
		answerDto: UpdateAnswerDto,
	): Promise<Answer> {
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
				throw new NotFoundException(
					'Question not found',
				);
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

		const answer: Answer = await this.answerRepository.preload({
			id: id,
		    option,
			question,
			group,
			lesson,
			points: answerDto.points,
			exist: answerDto.exist,
		});
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
}
