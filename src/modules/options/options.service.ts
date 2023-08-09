import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';

import { Option } from './option.entity';
import { CreateOptionDto, UpdateOptionDto, QueryOptionDto } from './dto';
import { Question } from '../questions/question.entity';
import { Answer } from '../answers/answer.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class OptionsService {
	constructor(
		@InjectRepository(Option)
		private readonly optionRepository: Repository<Option>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async getOptions(queryOption: QueryOptionDto): Promise<Option[]> {
		if (queryOption) {
			return await this.optionRepository.find({
				where: {
					sentence: queryOption.sentence
						? ILike(`%${queryOption.sentence}%`)
						: null,
					correct: queryOption.correct,
					identifier: queryOption.identifier,
					question: { id: queryOption.questionId },
					exist: queryOption.exist,
					institute: { id: queryOption.instituteId }
				},
				relations: ['question', 'institute'],
			});
		} else {
			return await this.optionRepository.find({
				relations: ['question', 'institute'],
			});
		}
	}

	async getOption(id: number, user: User): Promise<Option> {
		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id },
				relations: ['question', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
			if(user.institute.id !== option.institute.id){
				throw new ForbiddenException('You are not allowed to see this option');
			}
		return option;
	}
	async createOption(optionsDto: CreateOptionDto[], user : User): Promise<Option[]> {
		
		if (
			optionsDto.some(
				(optionDto) =>
					optionDto.questionId !== optionsDto[0].questionId ||
					optionDto.instituteId !== optionsDto[0].instituteId,
			)
		) {
			throw new BadRequestException(
				'All options must be from the same question and same institute',
			);
		}

		if(user.institute.id !== optionsDto[0].instituteId){
			throw new ForbiddenException('You are not allowed to create this option');
		}

		const correctOptions = optionsDto.filter((optionDto) => optionDto.correct);
		if (correctOptions.length > 1) {
			throw new BadRequestException(
				'Cannot mark two answer options as correct',
			);
		}

		if (
			await this.optionRepository.findOne({
				where: {
					question: { id: optionsDto[0].questionId },
					identifier: optionsDto[0].identifier,
				},
			})
		) {
			throw new BadRequestException(
				'An option with that idenfier already exist',
			);
		} else if (
			correctOptions.length == 1 &&
			(await this.optionRepository.findOne({
				where: {
					question: { id: optionsDto[0].questionId },
					correct: true,
				},
			}))
		) {
			throw new BadRequestException(
				'Cannot mark two answer options as correct',
			);
		}

		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: optionsDto[0].instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: optionsDto[0].questionId },
				relations: ['lesson','lesson.author']
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});

			if(user.rol !== Role.Admin && user.id !== question.lesson.author.id){
				throw new ForbiddenException('You are not allowed to create this option');
			}

		const options: Option[] = await Promise.all(
			optionsDto.map(async (optionDto) => {
				const option: Option = this.optionRepository.create({
					sentence: optionDto.sentence,
					correct: optionDto.correct,
					identifier: optionDto.identifier,
					question,
					institute,
					exist: optionDto.exist,
				});
				return option;
			}),
		);
		return this.optionRepository.save(options);
	}

	async updateOption(id: number, optionDto: UpdateOptionDto, user: User): Promise<Option> {
		if (
			await this.optionRepository.findOne({
				where: {
					question: { id: optionDto.questionId },
					identifier: optionDto.identifier,
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
					question: { id: optionDto.questionId },
					correct: true,
					id: Not(id),
				},
			}))
		) {
			throw new BadRequestException(
				'Cannot mark two answer options as correct',
			);
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: optionDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		const question: Question = await this.questionRepository
			.findOneOrFail({
				where: { id: optionDto.questionId },
				relations: ['lesson.author']
			})
			.catch(() => {
				throw new NotFoundException('Question not found');
			});

			if(user.rol !== Role.Admin &&  user.id !== question.lesson.author.id){
				throw new ForbiddenException('You are not allowed to update this option');
			}
		const option: Option = await this.optionRepository
			.preload({
				id: id,
				sentence: optionDto.sentence,
				correct: optionDto.correct,
				identifier: optionDto.identifier,
				question: question,
				institute,
				exist: optionDto.exist,
			})
			.catch(() => {
				throw new NotFoundException(
					'The option you want to update does not exist',
				);
			});
		return this.optionRepository.save(option);
	}

	async deleteOption(id: number, user: User): Promise<void> {
		const option: Option = await this.optionRepository.findOne({
			where: { id },
			relations: ['question', 'question.lesson.author'],
		});
		if (!option) {
			throw new NotFoundException(
				'The option you want to delete does not exist',
			);
		}
		if(user.rol !== Role.Admin && user.id !== option.question.lesson.author.id){
			throw new ForbiddenException('You are not allowed to delete this option');
		}
		this.optionRepository.remove(option);
	}

	async getAnswersByOption(id: number, user: User): Promise<Answer[]> {

		const option: Option = await this.optionRepository
			.findOneOrFail({
				where: { id },
				relations: ['answers'],
			})
			.catch(() => {
				throw new NotFoundException('Option not found');
			});
			if(user.institute.id !== option.institute.id){
				throw new ForbiddenException('You are not allowed to see this option');
			}
		return option.answers;
	}
}
