import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy, LocalStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.registerAsync({
			imports: [ConfigModule], // Import ConfigModule
			inject: [ConfigService], // Inject ConfigService
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get<string>('HASH_KEY'), // Get HASH_KEY from ConfigService
				signOptions: { expiresIn: '604800s' },
			}),
		}),
		UsersModule,
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	controllers: [AuthController],
})
export class AuthModule {}
