import { HttpException, HttpStatus } from '@nestjs/common';
import { validateEquality } from 'src/common/utils/validations';
import { User } from 'src/modules/users/user.entity';
import { Answer } from '../answers/answer.entity';
import { Area } from '../areas/area.entity';
import { Group } from '../groups/group.entity';
import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Period } from '../periods/period.entity';
import { Question } from '../questions/question.entity';

export enum Rol {
	Admin = 'admin',
	Superadmin = 'superadmin',
	Teacher = 'teacher',
	Student = 'Student',
	User = 'user',
}

export interface Rule {
	manage?: {};
	create?: {};
	read?: {};
	update?: {};
	delete?: {};
}

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

export type Entidades =
	| Area
	| Answer
	| User
	| Group
	| Institute
	| Lesson
	| Period
	| Question;

export function abilities(user: User, object: Entidades, action: Actions) {
	let rules: Rule;
	if (user.rol == Rol.Superadmin) {
		return true;
	} else if (user.rol == Rol.Admin) {
		rules = {
			manage: {
				course: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				user: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				answer: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				area: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				question: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				institute: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
			},
			create: rules.manage,
			read: rules.manage,
			update: rules.manage,
			delete: rules.manage,
		};
	} else if (user.rol == Rol.Student) {
		rules = {};
	}

	const result = rules[action][object.constructor.name.toLowerCase()];
	console.log(result);

	if (result != true) {
		throw new HttpException(
			{
				status: HttpStatus.FORBIDDEN,
				error: result.error,
			},
			HttpStatus.FORBIDDEN,
		);
	}
}
