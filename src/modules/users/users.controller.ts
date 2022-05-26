import {
	Controller,
	Get,
	Param,
	Post,
	Query,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}
	@Get()
	getUsers(@Query() queryUser: QueryUserDto): Promise<User[]> {
		return this.userService.getUsers(queryUser);
	}
	@Get(':id')
	getUser(@Param('id') id: number): Promise<User> {
		return this.userService.getUser(id);
	}

	@Post()
	createUser(@Body() user: CreateUserDto): Promise<User> {
		return this.userService.createUser(user);
	}

	@Patch(':id')
	updateUser(
		@Param('id') id: number,
		@Body() user: UpdateUserDto,
	): Promise<User> {
		return this.userService.updateUser(id, user);
	}
	@Delete(':id')
	deleteUser(@Param('id') id: number): Promise<void> {
		return this.userService.deleteUser(id);
	}
}
