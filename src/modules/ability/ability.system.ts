import { HttpException, HttpStatus } from '@nestjs/common';
import { Rules } from 'src/common/interfaces';
import { Actions } from 'src/common/types';
import { Entity } from 'src/common/types/entities.type';
import { Validation } from 'src/common/types/validations.type';
import { validateEquality } from 'src/common/utils/validations';
import { User } from 'src/modules/users/user.entity';

//add more roles if you need
export enum Rol {
	Admin = 'admin',
	Superadmin = 'superadmin',
	Teacher = 'teacher',
	Student = 'student',
	User = 'user',
}


//add more entities of rule if you need
export interface EntitiesOfRule {
	answer?: Validation;
	area?: Validation;
	course?: Validation;
	group?: Validation;
	institute?: Validation;
	lesson?: Validation;
	option?: Validation;
	period?: Validation;
	question?: Validation;
	user?: Validation;
}


export function abilities(user: User, object: Entity, action: Actions) {
	let permissions: Rules;
	if (user.rol == Rol.Superadmin) {
		return true;
	} else if (user.rol == Rol.Admin && object != 'all') {
		permissions = {
			manage: {
				answer: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				area: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				course: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				group: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				institute: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				lesson: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				option: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				period: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				question: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				user: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
			},
		};
	} else if (user.rol == Rol.Teacher && object != 'all') {
		permissions = {
			read: {
				answer: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				question: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				option: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				lesson: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				area: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				course: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of another institution' },
				user: validateEquality(user.institute.id, object, 'institute.id')
					? true
					: { error: 'You cannot read elements of another institution' },
				institute: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
				period: validateEquality(user.institute.id, object, 'id')
					? true
					: { error: 'You cannot modify elements of another institution' },
			},
			create: {
				answer: validateEquality(
					user.institute.id,
					object,
					'question.lesson.author.id',
				)
					? true
					: { error: 'You cannot modify elements of another institution' },
				question: validateEquality(user.id, object, 'lesson.author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				option: validateEquality(user.id, object, 'question.lesson.author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				lesson: validateEquality(user.id, object, 'author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
			},
			update: {
				answer: validateEquality(
					user.institute.id,
					object,
					'question.lesson.author.id',
				)
					? true
					: { error: 'You cannot modify elements of another institution' },
				question: validateEquality(user.id, object, 'lesson.author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				option: validateEquality(user.id, object, 'question.lesson.author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
				lesson: validateEquality(user.id, object, 'author.id')
					? true
					: { error: 'You cannot read elements of anothers author' },
			},
		};
	} else {
		permissions = {};
	}

	//don't change this
	const result =
		permissions.manage == undefined
			? permissions[action] == undefined
				? false
				: permissions[action][object.constructor.name.toLowerCase()] ==
				  undefined
				? false
				: permissions[action][object.constructor.name.toLowerCase()]
			: permissions.manage[object.constructor.name.toLowerCase()] == undefined
			? false
			: permissions.manage[object.constructor.name.toLowerCase()];

	if (result != true) {
		throw new HttpException(
			{
				status: HttpStatus.FORBIDDEN,
				error: result.error
					? result.error
					: 'You don´t have permissions to do this', //default error message
			},
			HttpStatus.FORBIDDEN,
		);
	}
}
