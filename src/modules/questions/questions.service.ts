import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';
import * as fs from 'fs';

import { QueryFailedError } from 'typeorm';
import {
	ConflictException,
	InternalServerErrorException,
} from '@nestjs/common';

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
				throw new NotFoundException('Lesson not found');
			});

		if (user.id !== lesson.author.id) {
			throw new ForbiddenException('You are not the author of this lesson');
		}

		try {
			const question: Question = this.questionRepository.create({
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

			return await this.questionRepository.save(question);
		} catch (error) {
			if (error instanceof QueryFailedError) {
				const errorCode = (error as any).code;

				switch (errorCode) {
					case '23505': // PostgreSQL
					case '1062': // MySQL
					case '2627': // SQL Server
					case 'ORA-00001': // Oracle
						throw new ConflictException('Este registro ya existe.');
					default:
						throw new InternalServerErrorException(
							'Error en la base de datos.',
						);
				}
			} else {
				throw new InternalServerErrorException('Error desconocido.');
			}
		}
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

	async resetIndex(): Promise<string> {
		const queryRunner =
			this.questionRepository.manager.connection.createQueryRunner();

		try {
			// Ejecutamos el script completo como una única query raw
			const query = `
				DO $$ 
				DECLARE
					table_record RECORD;
					max_id INT;
				BEGIN
					FOR table_record IN
						SELECT table_name
						FROM information_schema.tables
						WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
					LOOP
						-- Verificar si la columna 'id' existe en la tabla actual
						PERFORM column_name
						FROM information_schema.columns
						WHERE table_name = table_record.table_name AND column_name = 'id';
	
						IF FOUND THEN
							-- Si la columna 'id' existe, obtener el máximo valor de ID
							EXECUTE format('SELECT COALESCE(MAX(id), 0) FROM %I', table_record.table_name) INTO max_id;
	
							-- Reiniciar la secuencia de la columna de ID correspondiente
							EXECUTE format('ALTER SEQUENCE %s_id_seq RESTART WITH %s', table_record.table_name, max_id + 1);
						END IF;
					END LOOP;
				END $$;
			`;

			await queryRunner.query(query);

			return 'Secuencias reiniciadas exitosamente';
		} catch (error) {
			throw new Error(`Error al reiniciar las secuencias: ${error.message}`);
		} finally {
			// Siempre liberamos el queryRunner
			await queryRunner.release();
		}
	}
}
