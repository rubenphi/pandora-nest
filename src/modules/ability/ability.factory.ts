import {
	Ability,
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
} from '@casl/ability';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Answer } from '../answers/answer.entity';
import { Area } from '../areas/area.entity';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Option } from '../options/option.entity';
import { Period } from '../periods/period.entity';
import { Question } from '../questions/question.entity';
import { User } from '../users/user.entity';

export enum Action {
	Manage = 'manage',
	Create = 'create',
	Read = 'read',
	Update = 'update',
	Delete = 'delete',
}

export enum Rol {
	Admin = 'admin',
	Superadmin = 'superadmin',
	Teacher = 'teacher',
	Student = 'Student',
	User = 'user',
}

export type Subjects =
	| InferSubjects<
			| typeof Answer
			| typeof Area
			| typeof Group
			| typeof Institute
			| typeof Lesson
			| typeof Option
			| typeof Period
			| typeof Question
			| typeof User
	  >
	| 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
	defineAbility(user: User) {
		const { can, cannot, build } = new AbilityBuilder(
			Ability as AbilityClass<AppAbility>,
		);

		if (user.rol == Rol.Superadmin) {
			can(Action.Manage, 'all');
		} else if (user.rol == Rol.Admin) {
			can(Action.Manage, 'all');
			cannot(Action.Manage, Answer, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');
			cannot(Action.Manage, Area, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Course, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Group, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Lesson, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Option, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Period, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, Question, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
			cannot(Action.Manage, User, { institute: { $ne: user.institute } }).because('You cannot access this information because you do not belong to this institution.');;
		}
		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
