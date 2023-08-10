import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Institute } from '../institutes/institute.entity';
import { Invitation } from '../invitations/invitation.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Institute, Invitation])],
	providers: [UsersService],
	controllers: [UsersController],
	exports: [UsersService],
})
export class UsersModule {}
