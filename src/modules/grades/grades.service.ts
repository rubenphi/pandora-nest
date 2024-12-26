import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Grade } from './grade.entity';
import { User } from '../users/user.entity';
import { Lesson } from '../lessons/lesson.entity';
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
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}
	async create(createGradeDto: CreateGradeDto): Promise<Grade> {
		const grade = new Grade();
		grade.grade = createGradeDto.grade;
		grade.user = await this.userRepository.findOneBy({
			id: createGradeDto.userId,
		});
		grade.lesson = await this.lessonRepository.findOneBy({
			id: createGradeDto.lessonId,
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
				lesson: { id: queryGrades.lessonId },
				period: { id: queryGrades.periodId },
				institute: { id: queryGrades.instituteId },
				grade:
					queryGrades.gradeMax && queryGrades.gradeMin
						? Between(queryGrades.gradeMin, queryGrades.gradeMax)
						: undefined,
			},
			relations: ['user', 'lesson', 'lesson.area', 'period', 'institute'],
		});
	}

	async findOne(id: number): Promise<Grade> {
		return await this.gradeRepository
			.findOneOrFail({
				where: { id },
				relations: ['user', 'lesson', 'period', 'institute'],
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
		const lesson = await this.lessonRepository
			.findOneOrFail({
				where: { id: updateGradeDto.lessonId },
			})
			.catch(() => {
				throw new NotFoundException('Lesson not found');
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
			lesson: lesson,
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
