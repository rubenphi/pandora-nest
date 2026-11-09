import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from 'src/modules/auth/roles.decorator';
import { Group } from 'src/modules/groups/group.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Quiz } from 'src/modules/quizzes/quiz.entity';
import { User } from 'src/modules/users/user.entity';
import { UserToCourse } from 'src/modules/users/userToCourse.entity';
import { UserToGroup } from 'src/modules/users/userToGroup.entity';

export const COURSE_ACCESS_DENIED_MESSAGE =
	'No tienes acceso a este contenido porque no estás inscrito en el curso asignado.';

export const ANSWER_SCOPE_DENIED_MESSAGE =
	'La respuesta no corresponde a un usuario o grupo asignado al curso de este cuestionario.';

const STAFF_ROLES: string[] = [
	Role.Admin,
	Role.Director,
	Role.Coordinator,
	Role.Teacher,
];

export interface CourseAccessCheck {
	allowed: boolean;
	courseId: number | null;
	reason: string | null;
}

export interface AnswerScopeParams {
	actor: User;
	courseId: number | null;
	answerUserId: number;
	groupId?: number | null;
}

@Injectable()
export class CourseAccessService {
	constructor(
		@InjectRepository(Quiz)
		private readonly quizRepository: Repository<Quiz>,
		@InjectRepository(Question)
		private readonly questionRepository: Repository<Question>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(UserToGroup)
		private readonly userToGroupRepository: Repository<UserToGroup>,
	) {}

	isStaff(user: User): boolean {
		return !!user && STAFF_ROLES.includes(user.rol);
	}

	async getQuizCourseId(quizId: number): Promise<number | null> {
		const row = await this.quizRepository
			.createQueryBuilder('quiz')
			.innerJoin('quiz.lesson', 'lesson')
			.select('lesson.courseId', 'courseId')
			.where('quiz.id = :quizId', { quizId })
			.getRawOne<{ courseId: number | null }>();
		return row?.courseId ?? null;
	}

	async getQuestionCourseId(questionId: number): Promise<number | null> {
		const row = await this.questionRepository
			.createQueryBuilder('question')
			.innerJoin('question.quiz', 'quiz')
			.innerJoin('quiz.lesson', 'lesson')
			.select('lesson.courseId', 'courseId')
			.where('question.id = :questionId', { questionId })
			.getRawOne<{ courseId: number | null }>();
		return row?.courseId ?? null;
	}

	async isEnrolledInCourse(userId: number, courseId: number): Promise<boolean> {
		if (!userId || !courseId) return false;
		const total = await this.userToCourseRepository.count({
			where: { user: { id: userId }, course: { id: courseId }, active: true },
		});
		return total > 0;
	}

	async isGroupAssignedToCourse(
		groupId: number,
		courseId: number,
	): Promise<boolean> {
		if (!groupId || !courseId) return false;
		const total = await this.groupRepository.count({
			where: { id: groupId, course: { id: courseId }, active: true },
		});
		return total > 0;
	}

	async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
		if (!userId || !groupId) return false;
		const total = await this.userToGroupRepository.count({
			where: { user: { id: userId }, group: { id: groupId }, active: true },
		});
		return total > 0;
	}

	async checkQuizAccess(
		quizId: number,
		user: User,
	): Promise<CourseAccessCheck> {
		const courseId = await this.getQuizCourseId(quizId);
		if (courseId === null) {
			return { allowed: false, courseId: null, reason: 'Quiz not found' };
		}
		if (this.isStaff(user)) {
			return { allowed: true, courseId, reason: null };
		}
		const allowed = await this.isEnrolledInCourse(user.id, courseId);
		return {
			allowed,
			courseId,
			reason: allowed ? null : COURSE_ACCESS_DENIED_MESSAGE,
		};
	}

	async checkQuestionAccess(
		questionId: number,
		user: User,
	): Promise<CourseAccessCheck> {
		const courseId = await this.getQuestionCourseId(questionId);
		if (courseId === null) {
			return { allowed: false, courseId: null, reason: 'Question not found' };
		}
		if (this.isStaff(user)) {
			return { allowed: true, courseId, reason: null };
		}
		const allowed = await this.isEnrolledInCourse(user.id, courseId);
		return {
			allowed,
			courseId,
			reason: allowed ? null : COURSE_ACCESS_DENIED_MESSAGE,
		};
	}

	async assertQuizAccess(quizId: number, user: User): Promise<void> {
		if (this.isStaff(user)) return;
		const check = await this.checkQuizAccess(quizId, user);
		if (!check.allowed) {
			throw new ForbiddenException(check.reason);
		}
	}

	async assertQuestionAccess(questionId: number, user: User): Promise<void> {
		if (this.isStaff(user)) return;
		const check = await this.checkQuestionAccess(questionId, user);
		if (!check.allowed) {
			throw new ForbiddenException(check.reason);
		}
	}

	async assertCourseAccess(courseId: number | null, user: User): Promise<void> {
		if (this.isStaff(user)) return;
		if (courseId === null) {
			throw new NotFoundException('Resource not found');
		}
		if (!(await this.isEnrolledInCourse(user.id, courseId))) {
			throw new ForbiddenException(COURSE_ACCESS_DENIED_MESSAGE);
		}
	}

	async assertAnswerScope(params: AnswerScopeParams): Promise<void> {
		const { actor, courseId, answerUserId, groupId } = params;
		if (this.isStaff(actor)) return;
		if (answerUserId !== actor.id) {
			throw new ForbiddenException(ANSWER_SCOPE_DENIED_MESSAGE);
		}
		if (courseId === null) {
			throw new BadRequestException(
				'El cuestionario no está asociado a un curso, por lo que no se puede responder.',
			);
		}
		if (!(await this.isEnrolledInCourse(actor.id, courseId))) {
			throw new ForbiddenException(COURSE_ACCESS_DENIED_MESSAGE);
		}
		if (groupId) {
			const groupInCourse = await this.isGroupAssignedToCourse(
				groupId,
				courseId,
			);
			const userInGroup = await this.isUserInGroup(actor.id, groupId);
			if (!groupInCourse || !userInGroup) {
				throw new ForbiddenException(ANSWER_SCOPE_DENIED_MESSAGE);
			}
		}
	}
}
