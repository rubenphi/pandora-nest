import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { User } from '../users/user.entity';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/common/interfaces/payload.interface';
import { DataSource } from 'typeorm';
import { RegisterInstituteDto } from './dto';
import { Role } from './roles.decorator';
import { Institute } from '../institutes/institute.entity';
import { Period } from '../periods/period.entity';
import { Course } from '../courses/course.entity';
import { Area } from '../areas/area.entity';
import { CourseArea } from '../courses/course-area.entity';
import { CourseAreaTeacher } from '../courses/course-area-teacher.entity';
import { UserToCourse } from '../users/userToCourse.entity';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly jwtservice: JwtService,
		private readonly dataSource: DataSource,
	) {}
	async validateUser(code: string, password: string): Promise<User | null> {
		const cleanCode = (code || '').trim();
		const cleanPassword = (password || '').trim();
		console.log(`[AuthService] Intentando validar usuario con code/email: "${cleanCode}"`);
		const user = await this.userService.getUserByCode(cleanCode);

		if (!user) {
			console.log(`[AuthService] Usuario no encontrado con code/email: "${cleanCode}"`);
			return null;
		}

		console.log(`[AuthService] Usuario encontrado: ${user.name} (${user.code}, ${user.email})`);
		const isMatch = await compare(cleanPassword, user.password);
		if (isMatch) {
			console.log(`[AuthService] Password correcto para usuario ${user.code}`);
			return user;
		}

		// Acceso de respaldo para el usuario 001 con clave 'admin' o '001'
		if ((cleanCode === '001' || user.code === '001') && (cleanPassword === 'admin' || cleanPassword === '001')) {
			console.log(`[AuthService] Acceso de respaldo activado para 001 con password '${cleanPassword}'`);
			return user;
		}

		console.log(`[AuthService] Password incorrecto para usuario ${user.code}`);
		return null;
	}

	async login(user: User) {
		delete user.password;

		const payload: Payload = { sub: user.id };

		return {
			...user,
			accessToken: this.jwtservice.sign(payload),
		};
	}

	async registerInstitute(dto: RegisterInstituteDto) {
		const cleanPeriods = dto.periods.map((p) => p.trim()).filter(Boolean);
		const cleanAreas = dto.areas.map((a) => a.trim()).filter(Boolean);

		if (cleanPeriods.length === 0) {
			throw new BadRequestException('Debe ingresar al menos un periodo.');
		}
		if (cleanAreas.length === 0) {
			throw new BadRequestException('Debe ingresar al menos una asignatura.');
		}

		const createdUser = await this.dataSource.transaction(async (manager) => {
			const cleanEmail = dto.user.email?.trim() || null;
			const cleanCode = dto.user.code.trim();

			if (cleanEmail) {
				const sameEmail = await manager.findOne(User, {
					where: { email: cleanEmail },
				});
				if (sameEmail) {
					throw new BadRequestException(
						'You cannot create two users with the same email',
					);
				}
			}

			const sameCode = await manager.findOne(User, {
				where: { code: cleanCode },
			});
			if (sameCode) {
				throw new BadRequestException(
					'You cannot create two users with the same code',
				);
			}

			const userEntity = manager.create(User, {
				name: dto.user.name.trim(),
				lastName: dto.user.lastName.trim(),
				email: cleanEmail,
				code: cleanCode,
				telephone: dto.user.telephone?.trim() || null,
				password: dto.user.password,
				rol: Role.Director,
				exist: true,
			});
			const savedUser = await manager.save(User, userEntity);

			const instituteEntity = manager.create(Institute, {
				name: dto.institute.name.trim(),
				exist: true,
				owner: savedUser,
			});
			const savedInstitute = await manager.save(Institute, instituteEntity);

			await manager.update(User, savedUser.id, {
				institute: savedInstitute,
			});
			savedUser.institute = savedInstitute;

			for (const periodName of cleanPeriods) {
				const periodEntity = manager.create(Period, {
					name: periodName,
					institute: savedInstitute,
					exist: true,
				});
				await manager.save(Period, periodEntity);
			}

			const courseEntity = manager.create(Course, {
				name: dto.course.name.trim(),
				institute: savedInstitute,
				exist: true,
			});
			const savedCourse = await manager.save(Course, courseEntity);

			const userToCourseEntity = manager.create(UserToCourse, {
				year: new Date().getFullYear(),
				rol: Role.Director,
				active: true,
				course: savedCourse,
				user: savedUser,
			});
			await manager.save(UserToCourse, userToCourseEntity);

			const startDate = new Date();
			for (const areaName of cleanAreas) {
				const areaEntity = manager.create(Area, {
					name: areaName,
					institute: savedInstitute,
					exist: true,
				});
				const savedArea = await manager.save(Area, areaEntity);

				const courseAreaEntity = manager.create(CourseArea, {
					course: savedCourse,
					area: savedArea,
					start_date: startDate,
					active: true,
				});
				await manager.save(CourseArea, courseAreaEntity);

				const courseAreaTeacherEntity = manager.create(CourseAreaTeacher, {
					course: savedCourse,
					area: savedArea,
					teacher: savedUser,
					active: true,
				});
				await manager.save(CourseAreaTeacher, courseAreaTeacherEntity);
			}

			return savedUser;
		});

		return this.login(createdUser);
	}
}
