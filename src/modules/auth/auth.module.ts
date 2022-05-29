import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy, LocalStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';

const dotenv = require('dotenv');
dotenv.config();

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.HASH_KEY,
			signOptions: { expiresIn: '604800s' },
		}),
		UsersModule,
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
