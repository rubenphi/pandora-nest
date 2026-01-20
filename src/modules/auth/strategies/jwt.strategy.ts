import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { Payload } from 'src/common/interfaces/payload.interface';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private userService: UsersService,
		private configService: ConfigService, // Inject ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('HASH_KEY'), // Get HASH_KEY from ConfigService
		});
	}

	async validate(payload: Payload) {
		const { sub: id } = payload;
		return await this.userService.getUser(id);
	}
}
