import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Institute } from '../institutes/institute.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Institute])],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
