import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Option } from './option.entity';
import { CreateOptionDto, UpdateOptionDto, QueryOptionDto } from './dto';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';

@Injectable()
export class OptionsService {
	constructor(
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
	) {}

	async getOptions(queryOption: QueryOptionDto): Promise<Option[]> {
		if (queryOption) {
			return await this.optionRepository.find({
				where: {
					sentence: queryOption.sentence,
					correct: queryOption.correct,
					identifier: queryOption.identifier,
					question: { id: queryOption.questionId },
					exist: queryOption.exist,
				},
				relations: ['question'],
			});
		} else {
			return await this.optionRepository.find({ relations: ['question'] });
		}
	}

	async getOption(id: number): Promise<Option> {
		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id },
				relations: ['question'],
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
		return option;
	}
	async createOption(optionDto: CreateOptionDto): Promise<Option> {
		if (
			await this.optionRepository.findOneOrFail({
				where: {
					questionIdentifier: optionDto.questionId + '-' + optionDto.identifier,
				},
			})
		) {
			throw new BadRequestException(
				'An option with that idenfier already exist',
			);
		} else if (
			optionDto.correct &&
			(await this.optionRepository.findOneOrFail({
				where: { questionCorrect: optionDto.questionId + '-' + true },
			}))
		) {
			throw new BadRequestException(
				'Cannot mark two answer options as correct',
			);
		}
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: optionDto.questionId },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		const option: Option = await this.optionRepository.create({
			sentence: optionDto.sentence,
			correct: optionDto.correct,
			identifier: optionDto.identifier,
			question: question,
			questionCorrect: optionDto.questionId + '-' + optionDto.correct,
			questionIdentifier: optionDto.questionId + '-' + optionDto.identifier,
			exist: optionDto.exist,
		});
		return this.optionRepository.save(option);
	}

	async updateOption(id: number, optionDto: UpdateOptionDto): Promise<Option> {
		if (
			await this.optionRepository.findOne({
				where: {
					questionIdentifier: optionDto.questionId + '-' + optionDto.identifier,
					id: Not(id),
				},
			})
		) {
			throw new BadRequestException(
				'An option with that idenfier already exist',
			);
		} else if (
			optionDto.correct &&
			(await this.optionRepository.findOne({
				where: {
					questionCorrect: optionDto.questionId + '-' + true,
					id: Not(id),
				},
			}))
		) {
			throw new BadRequestException(
				'Cannot mark two answer options as correct',
			);
		}
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: optionDto.questionId },
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});
		const option: Option = await this.optionRepository
			.preload({
				id: id,
				sentence: optionDto.sentence,
				correct: optionDto.correct,
				identifier: optionDto.identifier,
				question: question,
				questionCorrect: optionDto.questionId + '-' + optionDto.correct,
				questionIdentifier: optionDto.questionId + '-' + optionDto.identifier,
				exist: optionDto.exist,
			})
			.catch(() => {
				throw new NotFoundException(
					'The option you want to update does not exist',
				);
			});
		return this.optionRepository.save(option);
	}

	async deleteOption(id: number): Promise<void> {
		const option: Option = await this.optionRepository.findOne({
			where: { id },
		});
		if (!option) {
			throw new NotFoundException(
				'The option you want to delete does not exist',
			);
		}
		this.optionRepository.remove(option);
	}

	async getAnswersByOption(id: number): Promise<Answer[]> {
		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id },
				relations: ['answers'],
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
		return option.answers;
	}
}
