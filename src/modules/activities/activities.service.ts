import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto, QueryActivityDto, UpdateActivityDto } from './dto';
import { User } from 'src/modules/users/user.entity';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { Institute } from 'src/modules/institutes/institute.entity';
import { Grade } from '../grades/grade.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';

@Injectable()
export class ActivitiesService {
	constructor(
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Grade)
		private readonly gradeRepository: Repository<Grade>,
		@InjectRepository(StudentCriterionScore)
		private readonly studentCriterionScoreRepository: Repository<StudentCriterionScore>,
	) {}

	async create(
		createActivityDto: CreateActivityDto,
		user: User,
	): Promise<Activity> {
		const lesson = await this.lessonRepository.findOne({
			where: { id: createActivityDto.lessonId },
		});

		if (!lesson) {
			throw new NotFoundException(
				`Lesson with ID ${createActivityDto.lessonId} not found`,
			);
		}

		let institute: Institute | undefined;
		if (createActivityDto.instituteId) {
			institute = await this.instituteRepository.findOne({
				where: { id: createActivityDto.instituteId },
			});
			if (!institute) {
				throw new NotFoundException(
					`Institute with ID ${createActivityDto.instituteId} not found`,
				);
			}
		} else if (user.institute) {
			institute = user.institute;
		}

		const activity = this.activityRepository.create({
			...createActivityDto,
			lesson,
			institute,
		});
		return this.activityRepository.save(activity);
	}

	async findAll(query: QueryActivityDto): Promise<Activity[]> {
		console.log(query.lessonId);

		return await this.activityRepository.find({
			where: {
				title: query.title ? ILike(`%${query.title}%`) : null,
				institute: { id: query.instituteId },
				lesson: {
					id: query.lessonId,
					course: { id: query.courseId },
					area: { id: query.areaId },
					year: query.year,
				},
			},
			relations: ['lesson', 'lesson.course', 'lesson.area', 'institute'],
		});
	}

	async findOne(id: number): Promise<Activity> {
		const activity = await this.activityRepository.findOne({
			where: { id },
			relations: [
				'criteria',
				'lesson',
				'institute',
				'lesson.course',
				'lesson.area',
				'lesson.period',
			],
		});
		if (!activity) {
			throw new NotFoundException(`Activity with ID ${id} not found`);
		}
		return activity;
	}

	async update(
		id: number,
		updateActivityDto: UpdateActivityDto,
	): Promise<Activity> {
		const activity = await this.activityRepository.findOneBy({ id });
		if (!activity) {
			throw new NotFoundException(`Activity with ID ${id} not found`);
		}

		let lesson: Lesson | undefined;
		if (updateActivityDto.lessonId) {
			lesson = await this.lessonRepository.findOne({
				where: { id: updateActivityDto.lessonId },
			});
			if (!lesson) {
				throw new NotFoundException(
					`Lesson with ID ${updateActivityDto.lessonId} not found`,
				);
			}
		}

		let institute: Institute | undefined;
		if (updateActivityDto.instituteId) {
			institute = await this.instituteRepository.findOne({
				where: { id: updateActivityDto.instituteId },
			});
			if (!institute) {
				throw new NotFoundException(
					`Institute with ID ${updateActivityDto.instituteId} not found`,
				);
			}
		}

		const updatedActivity = this.activityRepository.merge(activity, {
			...updateActivityDto,
			lesson: lesson || activity.lesson,
			institute: institute || activity.institute,
		});

		return this.activityRepository.save(updatedActivity);
	}

	async remove(id: number): Promise<void> {
		const result = await this.activityRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Activity with ID ${id} not found`);
		}
	}

	/* 	async getPendingGrading(query: QueryQuizDto): Promise<Quiz[]> {
			const { courseId, periodId, year, instituteId } = query;
	
			const quizzes: Quiz[] = await this.quizRepository.find({
				relations: ['lesson'],
				where: {
					lesson: {
						course: { id: courseId },
						period: { id: periodId },
						year: year,
					},
					institute: { id: instituteId },
				},
			});
	
			const quizzesWithPendingGrading: Quiz[] = [];
			for (const quiz of quizzes) {
				const answersCount = await this.answerRepository.count({
					where: { quiz: { id: quiz.id } },
				});
				console.log(quiz.lesson.topic, ':', answersCount);
	
				const gradesCount = await this.gradeRepository.count({
					where: {
						gradableId: quiz.id,
						gradableType: 'quiz',
					},
				});
	
				console.log(quiz.lesson.topic, ':', gradesCount);
	
				if (answersCount > gradesCount) {
					console.log(quiz.title);
					quizzesWithPendingGrading.push(quiz);
				}
			}
	
			return quizzesWithPendingGrading;
		}
	} */

	async getPendingGrading(query: QueryActivityDto): Promise<Activity[]> {
		const { courseId, periodId, year, instituteId } = query;

		const activities: Activity[] = await this.activityRepository.find({
			relations: ['lesson'],
			where: {
				lesson: {
					course: { id: courseId },
					period: { id: periodId },
					year: year,
				},
				institute: { id: instituteId },
			},
		});

		const activitiesWithPendingGrading: Activity[] = [];
		for (const activity of activities) {
			const scoresCount = await this.studentCriterionScoreRepository.count({
				where: { activity: { id: activity.id } },
			});
			console.log(activity.lesson.topic, ':', scoresCount);

			const gradesCount = await this.gradeRepository.count({
				where: {
					gradableId: activity.id,
					gradableType: 'activity',
				},
			});

			console.log(activity.lesson.topic, ':', gradesCount);

			if (scoresCount > 0 && gradesCount === 0) {
				console.log(activity.title);
				activitiesWithPendingGrading.push(activity);
			}
		}
		return activitiesWithPendingGrading;
	}
}
