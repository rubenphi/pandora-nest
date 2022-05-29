import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { Payload } from 'src/common/interfaces/payload.interface';
const dotenv = require('dotenv');
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private userService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: process.env.HASH_KEY,
		});
	}

	async validate(payload: Payload) {
		const { sub: id } = payload;
		return await this.userService.getUser(id);
	}
}
