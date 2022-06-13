import {
	Ability,
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Area } from '../areas/area.entity';
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

export type Subjects = InferSubjects<typeof User> | InferSubjects<typeof Area>;
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
	defineAbility(user: User) {
		const { can, cannot, build } = new AbilityBuilder(
			Ability as AbilityClass<AppAbility>,
		);

		if (user.rol == Rol.Superadmin) {
			can(Action.Manage, Area);
			can(Action.Manage, User);
		} else if (user.rol == Rol.User) {
			can(Action.Read, Area);
		}

		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>,
		});
	}
}
