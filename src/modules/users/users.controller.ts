import {
	Controller,
	Get,
	Param,
	Post,
	Query,
	Body,
	Patch,
	Delete,
	Req,
} from '@nestjs/common';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';

@ApiTags('Users Routes')
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}
	@Auth()
	@Get()
	getUsers(@Req() req, @Query() queryUser: QueryUserDto): Promise<User[]> {
		return this.userService.getUsers(queryUser);
	}

	@Auth()
	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.userService.getUser(id);
	}

	@Post()
	createUser(@Body() user: CreateUserDto): Promise<User> {
		return this.userService.createUser(user);
	}

	@Auth()
	@Patch(':id')
	updateUser(
		@Param('id') id: number,
		@Body() user: UpdateUserDto,
	): Promise<User> {
		return this.userService.updateUser(id, user);
	}

	@Auth()
	@Delete(':id')
	deleteUser(@Param('id') id: number): Promise<void> {
		return this.userService.deleteUser(id);
	}
}
