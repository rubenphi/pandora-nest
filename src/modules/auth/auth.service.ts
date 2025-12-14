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
		const user = await this.userService.getUserByCode(code);

		if (user && (await compare(password, user.password))) {
			return user;
		}
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
