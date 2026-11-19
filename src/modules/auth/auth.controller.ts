import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { LocalAuthGuard } from './guards';
import { NetworkDiscoveryService } from '../../common/services/network-discovery.service';

@ApiTags('Auth Routes')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly networkDiscoveryService: NetworkDiscoveryService,
	) {}
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Body() loginDto: LoginDto, @User() user: UserEntity) {
		const userLoged = await this.authService.login(user);
		return {
			message: 'Successfull Request',
			userLoged,
		};
	}
	@Auth()
	@Get('profile')
	profile(@User() user: UserEntity) {
		return {
			message: 'Successfull Request',
			user,
		};
	}

	@Get('server-ip')
	getServerIp() {
		return this.networkDiscoveryService.getServerNetworkInfo(process.env.PORT || 3000);
	}

	@Get('server-time')
	getServerTime() {
		const now = new Date();
		return {
			year: now.getFullYear(),
			month: now.getMonth() + 1, // Months are 0-indexed in JS
			day: now.getDate(),
			hour: now.getHours(),
			min: now.getMinutes(),
			second: now.getSeconds(),
			miliseconds: now.getMilliseconds(),
		};
	}
}
