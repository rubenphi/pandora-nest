import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AbilityModule } from '../ability/ability.module';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Institute]), AbilityModule],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
