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
	Student = 'student',
	User = 'user',
}



export type Validation = boolean | {error: string}

export interface EntitiesOfRule {
	course?: Validation ,
	user?: Validation,
	answer?: Validation,
	area?: Validation,
	question?: Validation,
	institute?: Validation
}

export interface Rule {
	manage?: EntitiesOfRule;
	create?: EntitiesOfRule;
	read?: EntitiesOfRule;
	update?: EntitiesOfRule;
	delete?: EntitiesOfRule;
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
	| Question
	| 'all';

export function abilities(user: User, object: Entidades, action: Actions) {
	let permissions: Rule;
	if (user.rol == Rol.Superadmin) {
		return true;
	} else if (user.rol == Rol.Admin && object != 'all') {
		permissions = {
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
			}
		}
		
	} else if (user.rol == Rol.Teacher && object != 'all' ) {
		permissions = {
			read: {
				course: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of another institution' },
				user: validateEquality(user.institute.id, object, 'institute.id')
				? true
				: { error: 'You cannot read elements of another institution' },
				question: validateEquality(user.id, object, 'lesson.author.id')
				? true
				: { error: 'You cannot read elements of anothers author' },
			},
			create: {
				question: validateEquality(user.id, object, 'lesson.author.id')
				? true
				: { error: 'You cannot creat elements for another author' },
			}

		};
	}
	else
	{
		permissions = {}
	}

	const result = permissions.manage == undefined ? permissions[action] == undefined ?  false: permissions[action][object.constructor.name.toLowerCase()]  == undefined? false: permissions[action][object.constructor.name.toLowerCase()]: permissions.manage[object.constructor.name.toLowerCase()] == undefined  ?false:permissions.manage[object.constructor.name.toLowerCase()]
	

	if (result != true) {
		throw new HttpException(
			{
				status: HttpStatus.FORBIDDEN,
				error: result.error ? result.error : 'You don´t have permissions to do this',
			},
			HttpStatus.FORBIDDEN,
		);
	}
}
