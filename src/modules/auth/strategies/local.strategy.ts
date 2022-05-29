import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/modules/users/user.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'code',
			passwordField: 'password',
		});
	}

	async validate(code: string, password: string): Promise<User> {
		const user = await this.authService.validateUser(code, password);
		if (!user) {
			throw new UnauthorizedException('Login user or password does not match');
		}
		return user;
	}
}
