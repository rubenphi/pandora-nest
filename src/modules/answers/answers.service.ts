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
	async getAnswer(id: number): Promise<Answer> {
		const answer: Answer = await this.answerRepository.findOne({
			where: { id: id },
			relations: ['option', 'question', 'group', 'lesson'],
		});
		if (!answer) {
			throw new NotFoundException('Answer not found');
		}
		return answer;
	}
	async createAnswer(answerDto: CreateAnswerDto): Promise<Answer> {
		const option: Option = await this.optionRepository.findOneOrFail({
			where: { id: answerDto.option_id },
		}).catch(()=> {throw new NotFoundException('option not found')});
		const question: Question = await this.questionRepository.findOneOrFail({
			where: { id: answerDto.question_id },
		}).catch(()=> {throw new NotFoundException('question not found')});
		const group: Group = await this.groupRepository.findOneOrFail({
			where: { id: answerDto.group_id },
		}).catch(()=> {throw new NotFoundException('group not found')});
		const lesson: Lesson = await this.lessonRepository.findOneOrFail({
			where: { id: answerDto.lesson_id },
		}).catch(()=> {throw new NotFoundException('lesson not found')});

		const points: number = option.correct ? question.points : 0;
		const answer: Answer = await this.answerRepository.create({
			option: option,
			question: question,
			group: group,
			lesson: lesson,
			points: points,
			exist: answerDto.exist,
		});
		return this.answerRepository.save(answer);
	}
	async updateAnswer(id: number, answerDto: UpdateAnswerDto): Promise<Answer> {
		const option: Option = await this.optionRepository.findOneOrFail({
			where: { id: answerDto.option_id },
		}).catch((e)=>e);
		const question: Question = await this.questionRepository.findOneOrFail({
			where: { id: answerDto.question_id },
		}).catch((e)=>e);
		const group: Group = await this.groupRepository.findOneOrFail({
			where: { id: answerDto.group_id },
		}).catch((e)=>e);
		const lesson: Lesson = await this.lessonRepository.findOneOrFail({
			where: { id: answerDto.lesson_id },
		}).catch((e)=>e);

		const answer: Answer = await this.answerRepository.preload({
			id: id,
			option: option,
			question: question,
			group: group,
			lesson: lesson,
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
		const answer: Answer = await this.answerRepository.findOne({
			where: { id: id },
		});
		if (!answer) {
			throw new NotFoundException(
				'The answer you want to delete does not exist',
			);
		}
		this.answerRepository.remove(answer);
	}
}
