import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reinforcement } from './reinforcement.entity';
import {
	CreateReinforcementDto,
	UpdateReinforcementDto,
	FindReinforcementByContextDto,
} from './dto';
import { User } from '../users/user.entity';
import { Area } from '../areas/area.entity';
import { Period } from '../periods/period.entity';
import { Course } from '../courses/course.entity';
import { ReinforcementGradableItem } from './reinforcement-gradable-item.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Activity } from '../activities/activity.entity';
import { CreateReinforcementLessonDto } from './dto/create-reinforcement-lesson.dto';
import { UpdateReinforcementLessonDto } from './dto/update-reinforcement-lesson.dto';
import { Lesson, LessonType } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';

@Injectable()
export class ReinforcementService {
	constructor(
		@InjectRepository(Reinforcement)
		private readonly reinforcementRepository: Repository<Reinforcement>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Area)
		private readonly areaRepository: Repository<Area>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(ReinforcementGradableItem)
		private readonly reinforcementGradableItemRepository: Repository<ReinforcementGradableItem>,
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Activity)
		private readonly activityRepository: Repository<Activity>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
	) {}

	async create(createReinforcementDto: CreateReinforcementDto) {
		const student = await this.userRepository.findOneBy({
			id: createReinforcementDto.studentId,
		});
		if (!student) throw new NotFoundException('Student not found');

		const teacher = await this.userRepository.findOneBy({
			id: createReinforcementDto.teacherId,
		});
		if (!teacher) throw new NotFoundException('Teacher not found');

		const area = await this.areaRepository.findOneBy({
			id: createReinforcementDto.areaId,
		});
		if (!area) throw new NotFoundException('Area not found');

		const period = await this.periodRepository.findOneBy({
			id: createReinforcementDto.periodId,
		});
		if (!period) throw new NotFoundException('Period not found');

		const course = await this.courseRepository.findOneBy({
			id: createReinforcementDto.courseId,
		});
		if (!course) throw new NotFoundException('Course not found');

		const reinforcement = this.reinforcementRepository.create({
			student,
			teacher,
			area,
			grade: createReinforcementDto.grade,
			year: createReinforcementDto.year,
			period,
			course,
		});

		const savedReinforcement = await this.reinforcementRepository.save(
			reinforcement,
		);

		if (
			createReinforcementDto.gradableItems &&
			createReinforcementDto.gradableItems.length > 0
		) {
			await this.addGradableItems(
				savedReinforcement,
				createReinforcementDto.gradableItems,
			);
		}

		return this.findOne(savedReinforcement.id);
	}

	findAll() {
		return this.reinforcementRepository.find({
			relations: [
				'student',
				'teacher',
				'area',
				'period',
				'course',
				'gradableItems',
			],
		});
	}

	async findAllByContext(query: FindReinforcementByContextDto) {
		const whereClause: any = {
			course: { id: query.courseId },
			area: { id: query.areaId },
			period: { id: query.periodId },
			year: query.year,
		};

		if (query.lessonType) {
			whereClause.lesson = { type: query.lessonType };
		}

		if (query.studentId) {
			whereClause.student = { id: query.studentId };
		}

		return this.reinforcementRepository.find({
			where: whereClause,
			relations: ['student', 'lesson'],
		});
	}

	findOne(id: number) {
		return this.reinforcementRepository.findOne({
			where: { id },
			relations: [
				'student',
				'teacher',
				'area',
				'period',
				'course',
				'gradableItems',
			],
		});
	}

	async update(id: number, updateReinforcementDto: UpdateReinforcementDto) {
		const reinforcement = await this.findOne(id);
		if (!reinforcement) throw new NotFoundException('Reinforcement not found');

		if (updateReinforcementDto.studentId) {
			const student = await this.userRepository.findOneBy({
				id: updateReinforcementDto.studentId,
			});
			if (!student) throw new NotFoundException('Student not found');
			reinforcement.student = student;
		}

		if (updateReinforcementDto.teacherId) {
			const teacher = await this.userRepository.findOneBy({
				id: updateReinforcementDto.teacherId,
			});
			if (!teacher) throw new NotFoundException('Teacher not found');
			reinforcement.teacher = teacher;
		}

		if (updateReinforcementDto.areaId) {
			const area = await this.areaRepository.findOneBy({
				id: updateReinforcementDto.areaId,
			});
			if (!area) throw new NotFoundException('Area not found');
			reinforcement.area = area;
		}

		if (updateReinforcementDto.periodId) {
			const period = await this.periodRepository.findOneBy({
				id: updateReinforcementDto.periodId,
			});
			if (!period) throw new NotFoundException('Period not found');
			reinforcement.period = period;
		}

		if (updateReinforcementDto.courseId) {
			const course = await this.courseRepository.findOneBy({
				id: updateReinforcementDto.courseId,
			});
			if (!course) throw new NotFoundException('Course not found');
			reinforcement.course = course;
		}

		if (updateReinforcementDto.grade !== undefined) {
			reinforcement.grade = updateReinforcementDto.grade;
		}

		if (updateReinforcementDto.year !== undefined) {
			reinforcement.year = updateReinforcementDto.year;
		}

		await this.reinforcementRepository.save(reinforcement);

		if (updateReinforcementDto.gradableItems) {
			// Remove existing
			await this.reinforcementGradableItemRepository.delete({
				reinforcementId: id,
			});
			// Add new
			if (updateReinforcementDto.gradableItems.length > 0) {
				await this.addGradableItems(
					reinforcement,
					updateReinforcementDto.gradableItems,
				);
			}
		}

		return this.findOne(id);
	}

	remove(id: number) {
		return this.reinforcementRepository.delete(id);
	}

	private async addGradableItems(
		reinforcement: Reinforcement,
		items: { id: number; type: string }[],
	) {
		for (const item of items) {
			if (item.type === 'quiz') {
				const quiz = await this.quizRepository.findOneBy({ id: item.id });
				if (!quiz)
					throw new BadRequestException(`Quiz with ID ${item.id} not found`);
			} else if (item.type === 'activity') {
				const activity = await this.activityRepository.findOneBy({
					id: item.id,
				});
				if (!activity)
					throw new BadRequestException(
						`Activity with ID ${item.id} not found`,
					);
			} else {
				throw new BadRequestException(`Invalid gradable type: ${item.type}`);
			}

			const gradableItem = this.reinforcementGradableItemRepository.create({
				reinforcement,
				gradableId: item.id,
				gradableType: item.type,
			});
			await this.reinforcementGradableItemRepository.save(gradableItem);
		}
	}

	async createReinforcementLesson(dto: CreateReinforcementLessonDto) {
		const {
			studentIds,
			teacherId,
			areaId,
			periodId,
			courseId,
			instituteId,
			topic,
			date,
			year,
		} = dto;

		const teacher = await this.userRepository.findOneByOrFail({
			id: teacherId,
		});
		const area = await this.areaRepository.findOneByOrFail({ id: areaId });
		const period = await this.periodRepository.findOneByOrFail({
			id: periodId,
		});
		const course = await this.courseRepository.findOneByOrFail({
			id: courseId,
		});
		const institute = await this.instituteRepository.findOneByOrFail({
			id: instituteId,
		});

		// Create Lesson
		const lesson = this.lessonRepository.create({
			topic,
			date,
			year,
			type: dto.lessonType || LessonType.REINFORCEMENT,
			exist: true,
			author: teacher,
			area,
			period,
			course,
			institute,
		});

		const savedLesson = await this.lessonRepository.save(lesson);

		// Create Reinforcements for each student
		if (studentIds && studentIds.length > 0) {
			const reinforcements: Reinforcement[] = [];
			for (const studentId of studentIds) {
				const student = await this.userRepository.findOneBy({ id: studentId });
				if (student) {
					const reinforcement = this.reinforcementRepository.create({
						student,
						teacher,
						area,
						course,
						period,
						grade: 0,
						year,
						lesson: savedLesson,
					});
					reinforcements.push(reinforcement);
				}
			}
			await this.reinforcementRepository.save(reinforcements);
		}

		return savedLesson;
	}

	async getReinforcementsByLesson(lessonId: number) {
		return this.reinforcementRepository.find({
			where: { lesson: { id: lessonId } },
			relations: ['student'],
		});
	}

	async updateReinforcementLesson(
		id: number,
		dto: UpdateReinforcementLessonDto,
	) {
		const lesson = await this.lessonRepository.findOne({
			where: { id },
			relations: ['area', 'period', 'course', 'institute'],
		});
		if (!lesson) throw new NotFoundException('Lesson not found');

		// Update basic lesson info
		if (dto.topic) lesson.topic = dto.topic;
		if (dto.date) lesson.date = dto.date;
		await this.lessonRepository.save(lesson);

		// Update students
		if (dto.studentIds) {
			const currentReinforcements = await this.getReinforcementsByLesson(id);
			const currentStudentIds = currentReinforcements.map((r) => r.student.id);

			const newStudentIds = dto.studentIds;

			// Identify removals
			const studentsToRemove = currentReinforcements.filter(
				(r) => !newStudentIds.includes(r.student.id),
			);
			if (studentsToRemove.length > 0) {
				await this.reinforcementRepository.remove(studentsToRemove);
			}

			// Identify additions
			const studentsToAddIds = newStudentIds.filter(
				(sid) => !currentStudentIds.includes(sid),
			);

			const teacher = await this.userRepository.findOneBy({
				id: dto.teacherId,
			}); // Or existing teacher from somewhere? ideally passed in DTO
			// If teacherId is not in DTO (Partial), we might fail. Use lesson.author if possible, but lesson doesn't strictly link author here
			// In Create DTO teacherId is required. Update DTO is Partial.
			// Let's assume teacherId is passed or we default to existing teacher if we could find one from existing reinforcements?
			// Actually, we need a teacher for new records.
			if (studentsToAddIds.length > 0 && !dto.teacherId) {
				// Try to find teacher from existing reinforcements or lesson author
				// If not found, throw error? Or just use first one.
				// For now, let's assume valid teacherId is passed if adding students,
				// or we re-use if existing reinforcements have one.
			}
			// Better: Require teacherId if adding students, OR fetch it from one of existing reinforcements?
			// Let's just fetch it from `teacherId` if present, else try to find from existing.

			let teacherToUse = teacher;
			if (!teacherToUse && currentReinforcements.length > 0) {
				teacherToUse = currentReinforcements[0].teacher;
			}
			if (!teacherToUse && studentsToAddIds.length > 0) {
				// Fallback or error. The user is editing, so they are the teacher?
				// We can rely on frontend sending it.
				// However, update DTO has it optional.
				throw new BadRequestException(
					'Teacher ID is required to add new students',
				);
			}

			if (studentsToAddIds.length > 0) {
				const reinforcements: Reinforcement[] = [];
				for (const studentId of studentsToAddIds) {
					const student = await this.userRepository.findOneBy({
						id: studentId,
					});
					if (student) {
						const reinforcement = this.reinforcementRepository.create({
							student,
							teacher: teacherToUse,
							area: lesson.area,
							course: lesson.course,
							period: lesson.period,
							grade: 0,
							year: lesson.year,
							lesson: lesson,
						});
						reinforcements.push(reinforcement);
					}
				}
				await this.reinforcementRepository.save(reinforcements);
			}
		}

		return lesson;
	}

	async countStudentReinforcements(
		studentId: number,
		courseId: number,
		areaId: number,
		periodId: number,
		year: number,
		lessonType?: LessonType,
	) {
		const whereClause: any = {
			student: { id: studentId },
			course: { id: courseId },
			area: { id: areaId },
			period: { id: periodId },
			year: year,
		};

		if (lessonType) {
			whereClause.lesson = { type: lessonType };
		}

		return this.reinforcementRepository.count({
			where: whereClause,
		});
	}
}
