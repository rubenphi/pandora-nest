import { SetMetadata } from '@nestjs/common';

export enum Role {
	Admin = 'admin',
	User = 'user',
	Teacher = 'teacher',
	Student = 'student',
	Director = 'director',
	Coordinator = 'coordinator',
}

export const Roles = (...args: string[]) => SetMetadata('roles', args);
