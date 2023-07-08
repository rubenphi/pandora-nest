import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto';
import { LocalAuthGuard } from './guards';

@ApiTags('Auth Routes')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	@UseGuards(LocalAuthGuard)
	@Post('login')
	async login(@Body() loginDto: LoginDto, @User() user: UserEntity) {
		const userLoged = await this.authService.login(user);
		return {
			message : 'Successfull Request',
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
}
