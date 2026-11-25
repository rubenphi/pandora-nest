import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
	AttendanceScope,
	AttendanceSession,
} from './attendance-session.entity';
import { AttendanceRecord } from './attendance-record.entity';
import {
	QueryAttendanceDto,
	SaveAttendanceSessionDto,
} from './dto/attendance.dto';
import { Course } from '../courses/course.entity';
import { Lesson } from '../lessons/lesson.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AttendanceService {
	constructor(
		@InjectRepository(AttendanceSession)
		private readonly sessionRepo: Repository<AttendanceSession>,
		@InjectRepository(AttendanceRecord)
		private readonly recordRepo: Repository<AttendanceRecord>,
		@InjectRepository(Course)
		private readonly courseRepo: Repository<Course>,
		@InjectRepository(Lesson)
		private readonly lessonRepo: Repository<Lesson>,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async findSessions(
		query: QueryAttendanceDto,
		user: User,
	): Promise<AttendanceSession[]> {
		const where: any = {};
		if (user.institute?.id) {
			where.institute = { id: user.institute.id };
		}
		if (query.courseId) {
			where.course = { id: Number(query.courseId) };
		}
		if (query.year) {
			where.year = Number(query.year);
		}
		if (query.date) {
			where.date = query.date;
		}
		if (query.scope) {
			where.scope = query.scope;
		}
		if (query.lessonId) {
			where.lesson = { id: Number(query.lessonId) };
		}

		return this.sessionRepo.find({
			where,
			relations: ['course', 'lesson', 'author', 'records', 'records.student'],
			order: { date: 'DESC', createdAt: 'DESC' },
		});
	}

	async findOne(id: number): Promise<AttendanceSession> {
		const session = await this.sessionRepo.findOne({
			where: { id },
			relations: ['course', 'lesson', 'author', 'records', 'records.student'],
		});
		if (!session) {
			throw new NotFoundException('Sesión de asistencia no encontrada');
		}
		return session;
	}

	async saveSession(
		dto: SaveAttendanceSessionDto,
		user: User,
	): Promise<AttendanceSession> {
		const course = await this.courseRepo.findOne({
			where: { id: dto.courseId },
			relations: ['institute'],
		});
		if (!course) {
			throw new NotFoundException('Curso no encontrado');
		}

		let lesson: Lesson | null = null;
		if (dto.scope === AttendanceScope.LESSON) {
			if (!dto.lessonId) {
				throw new BadRequestException(
					'lessonId es requerido cuando scope es lesson',
				);
			}
			lesson = await this.lessonRepo.findOne({ where: { id: dto.lessonId } });
			if (!lesson) {
				throw new NotFoundException('Lección no encontrada');
			}
		}

		// Upsert: buscar sesión existente para ese curso + fecha + scope (+ lesson si aplica)
		let existing: AttendanceSession | null = null;
		if (dto.scope === AttendanceScope.LESSON && lesson) {
			existing = await this.sessionRepo.findOne({
				where: {
					scope: AttendanceScope.LESSON,
					course: { id: course.id },
					lesson: { id: lesson.id },
					date: dto.date,
				},
				relations: ['records'],
			});
		} else {
			existing = await this.sessionRepo.findOne({
				where: {
					scope: AttendanceScope.GENERAL,
					course: { id: course.id },
					date: dto.date,
					lesson: IsNull(),
				},
				relations: ['records'],
			});
		}

		const studentIds = dto.records.map((r) => r.studentId);
		const students =
			studentIds.length > 0
				? await this.userRepo.find({ where: { id: In(studentIds) } })
				: [];
		const studentMap = new Map(students.map((s) => [s.id, s]));

		let session: AttendanceSession;
		if (existing) {
			existing.closingTime = dto.closingTime ?? existing.closingTime;
			existing.author = user;
			existing.year = dto.year;
			await this.recordRepo.delete({ session: { id: existing.id } });
			session = await this.sessionRepo.save(existing);
		} else {
			const institute = course.institute || user.institute;
			session = await this.sessionRepo.save(
				this.sessionRepo.create({
					scope: dto.scope,
					date: dto.date,
					closingTime: dto.closingTime ?? null,
					year: dto.year,
					course,
					lesson,
					institute,
					author: user,
				}),
			);
		}

		const recordsToSave: AttendanceRecord[] = [];
		for (const item of dto.records) {
			const student = studentMap.get(item.studentId);
			if (!student) continue;
			recordsToSave.push(
				this.recordRepo.create({
					session,
					student,
					status: item.status,
					eventTime: item.eventTime ?? null,
					scannedByMarker: Boolean(item.scannedByMarker),
					note: item.note ?? null,
				}),
			);
		}

		if (recordsToSave.length > 0) {
			await this.recordRepo.save(recordsToSave);
		}

		return this.findOne(session.id);
	}
}
