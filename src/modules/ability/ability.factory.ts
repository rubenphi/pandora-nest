import {
	Ability,
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { Answer } from '../answers/answer.entity';
import { Area } from '../areas/area.entity';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
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

export type Subjects = InferSubjects<
	| typeof User
	| typeof Answer
	| typeof Area
	| typeof Group
	| typeof Lesson
	| typeof Option
	| typeof Question
> | 'all';
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
			cannot(Action.Manage, Course, { institute: { id: user.id   }});
			
		}
		
		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
