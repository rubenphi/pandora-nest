import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy, LocalStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';

import * as dotenv from 'dotenv';
import { PermissionsModule } from '../permissions/permissions.module';

dotenv.config();

@Module({
	imports: [
		PermissionsModule,
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.HASH_KEY,
			signOptions: { expiresIn: '604800s' },
		}),
		UsersModule,
		PermissionsModule,
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
