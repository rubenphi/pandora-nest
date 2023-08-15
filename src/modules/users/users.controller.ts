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
import { Auth , User as UserDecorator} from 'src/common/decorators';
import { Course } from '../courses/course.entity';
import { UserToCourse } from './userToCourse.entity';
import { QueryUserCoursesDto } from './dto/query-users-courses.dto';
import { UserToGroup } from './userToGroup.entity';
import { QueryUserGroupsDto } from './dto/query-users-group.dto';

@ApiTags('Users Routes')
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}
	@Auth()
	@Get()
	getUsers( @Query() queryUser: QueryUserDto): Promise<User[]> {
		return this.userService.getUsers(queryUser);
	}

	@Auth()
	@Get(':id')
	getUser(@Param('id') id: number, @UserDecorator() user: User): Promise<User> {
		return this.userService.getUser(id, user );
	}

	@Post()
	createUser(@Body() user: CreateUserDto): Promise<User> {
		return this.userService.createUser(user);
	}

	@Auth()
	@Patch(':id')
	updateUser(
		@Param('id') id: number,
		@Body() userDto: UpdateUserDto,
		@UserDecorator() user: User
	): Promise<User> {
		return this.userService.updateUser(id, userDto, user);
	}

	@Auth()
	@Delete(':id')
	deleteUser(@Param('id') id: number): Promise<void> {
		return this.userService.deleteUser(id);
	}

	@Auth()
	@Get(':id/courses')
	getUserCourses(@Param('id') id: number, @Query() queryCourses: QueryUserCoursesDto): Promise<UserToCourse[]> {
		return this.userService.getUserCourses(queryCourses , id);
	}

	@Auth()
	@Get(':id/groups')
	getUserGroups(@Param('id') id: number, @Query() queryGroups: QueryUserGroupsDto): Promise<UserToGroup[]> {
		return this.userService.getUserGroups(queryGroups , id);
	}
}
