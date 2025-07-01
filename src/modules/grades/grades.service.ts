import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Grade } from './grade.entity';
import { User } from '../users/user.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Period } from '../periods/period.entity';
import { Institute } from '../institutes/institute.entity';
import { QueryGradeDto } from './dto/query-grade.dto';

@Injectable()
export class GradesService {
	constructor(
		@InjectRepository(Grade)
		private readonly gradeRepository: Repository<Grade>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}
	async create(createGradeDto: CreateGradeDto): Promise<Grade> {
		const grade = new Grade();
		//search grade with same user and quiz
		const gradeExist = await this.gradeRepository.findOne({
			where: {
				user: { id: createGradeDto.userId },
				quiz: { id: createGradeDto.quizId },
			},
		});

		if (gradeExist) {
			return gradeExist;
		}

		grade.grade = createGradeDto.grade;
		grade.user = await this.userRepository.findOneByOrFail({
			id: createGradeDto.userId,
		});
		grade.quiz = await this.quizRepository.findOneBy({
			id: createGradeDto.quizId,
		});
		grade.period = await this.periodRepository.findOneBy({
			id: createGradeDto.periodId,
		});
		grade.institute = await this.instituteRepository.findOneBy({
			id: createGradeDto.instituteId,
		});
		return this.gradeRepository.save(grade);
	}

	async findAll(queryGrades: QueryGradeDto): Promise<Grade[]> {
		return this.gradeRepository.find({
			where: {
				user: { id: queryGrades.userId },
				quiz: {
					id: queryGrades.quizId,
					lesson: {
						course: { id: queryGrades.courseId },
						year: queryGrades.year,
					},
				},
				period: { id: queryGrades.periodId },
				institute: { id: queryGrades.instituteId },
				grade:
					queryGrades.gradeMax && queryGrades.gradeMin
						? Between(queryGrades.gradeMin, queryGrades.gradeMax)
						: undefined,
			},
			relations: [
				'user',
				'quiz',
				'quiz.lesson',
				'quiz.lesson.course',
				'period',
				'institute',
			],
		});
	}

	async findOne(id: number): Promise<Grade> {
		return await this.gradeRepository
			.findOneOrFail({
				where: { id },
				relations: ['user', 'quiz', 'period', 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Grade not found');
			});
	}

	async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
		//preload
		const userToGrade = await this.userRepository
			.findOneOrFail({
				where: { id: updateGradeDto.userId },
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});
		const quiz = await this.quizRepository
			.findOneOrFail({
				where: { id: updateGradeDto.quizId },
			})
			.catch(() => {
				throw new NotFoundException('Quiz not found');
			});
		const period = await this.periodRepository
			.findOneOrFail({
				where: { id: updateGradeDto.periodId },
			})
			.catch(() => {
				throw new NotFoundException('Period not found');
			});
		const institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: updateGradeDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});

		const grade = await this.gradeRepository.preload({
			id: id,
			user: userToGrade,
			quiz: quiz,
			period: period,
			grade: updateGradeDto.grade,
			institute: institute,
		});

		return await this.gradeRepository.save(grade);
	}

	async remove(id: number): Promise<void> {
		this.gradeRepository.delete(id);
	}
}
