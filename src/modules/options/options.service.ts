import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';

import { Option } from './option.entity';
import { CreateOptionDto, UpdateOptionDto, ImportOptionsDto } from './dto';
import { Question } from '../questions/question.entity';

@Injectable()
export class OptionsService {
	constructor(
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
	) {}

	async getOptions(): Promise<Option[]> {
		return await this.optionRepository.find({ relations: ['question'] });
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
				where: { identifier: optionDto.identifier },
			})
		) {
			throw new BadRequestException(
				'An option with that idenfier already exist',
			);
		} else if (
			optionDto.correct &&
			(await this.optionRepository.findOneOrFail({ where: { correct: true } }))
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
			exist: optionDto.exist,
		});
		return this.optionRepository.save(option);
	}
	async importOptions(importOptionsDto: ImportOptionsDto): Promise<Option[]>{
		const options = await this.optionRepository.find({ relations: ['question'] , where: {question: { id: importOptionsDto.from_question}}});
		return
	}
	async updateOption(id: number, optionDto: UpdateOptionDto): Promise<Option> {
		if (
			await this.optionRepository.findOneOrFail({
				where: { identifier: optionDto.identifier, id: Not(id) },
			})
		) {
			throw new BadRequestException(
				'An option with that idenfier already exist',
			);
		} else if (
			optionDto.correct &&
			(await this.optionRepository.findOneOrFail({
				where: { correct: true, id: Not(id) },
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
			.catch((e) => e);
		const option: Option = await this.optionRepository
			.preload({
				id: id,
				sentence: optionDto.sentence,
				correct: optionDto.correct,
				identifier: optionDto.identifier,
				question: question,
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
		const option: Option = await this.optionRepository.findOneOrFail({
			where: { id },
		});
		if (!option) {
			throw new NotFoundException(
				'The option you want to delete does not exist',
			);
		}
		this.optionRepository.remove(option);
	}
}
