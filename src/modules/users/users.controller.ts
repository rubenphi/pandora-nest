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
import {
	CreateUserDto,
	UpdateUserDto,
	QueryUserDto,
	CreateBulkUserDto,
} from './dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, User as UserDecorator } from 'src/common/decorators';
import { Course } from '../courses/course.entity';
import { UserToCourse } from './userToCourse.entity';
import { QueryUserCoursesDto } from './dto/query-users-courses.dto';
import { UserToGroup } from './userToGroup.entity';
import { QueryUserGroupsDto } from './dto/query-users-group.dto';
import { UserToGroupDto } from './dto/user-to-group.dto';
import {
	AssignmentType,
	DeactivateUserAssignmentsDto,
} from './dto/deactivate-user-assignments.dto';

@ApiTags('Users Routes')
@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}
	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: 'Return all users.' })
	getUsers(@Query() queryUser: QueryUserDto): Promise<User[]> {
		return this.userService.getUsers(queryUser);
	}

	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a user by id' })
	@ApiResponse({ status: 200, description: 'Return a user.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	getUser(@Param('id') id: number, @UserDecorator() user: User): Promise<User> {
		return this.userService.getUser(id, user);
	}

	@Post()
	@ApiOperation({ summary: 'Create a user' })
	@ApiResponse({ status: 201, description: 'The user has been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createUser(
		@Body() user: CreateUserDto,
		@UserDecorator() userLoged: User,
	): Promise<User> {
		return this.userService.createUser(user, userLoged);
	}

	@Auth()
	@Post('bulk')
	@ApiOperation({ summary: 'Create bulk users' })
	@ApiResponse({ status: 201, description: 'The users have been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createBulkUsers(
		@Body() createBulkUserDto: CreateBulkUserDto,
		@UserDecorator() userLoged: User,
	): Promise<User[]> {
		return this.userService.createBulkUsers(createBulkUserDto, userLoged);
	}

	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a user' })
	@ApiResponse({ status: 200, description: 'The user has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	updateUser(
		@Param('id') id: number,
		@Body() userDto: UpdateUserDto,
		@UserDecorator() user: User,
	): Promise<User> {
		return this.userService.updateUser(id, userDto, user);
	}

	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a user' })
	@ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	deleteUser(@Param('id') id: number): Promise<void> {
		return this.userService.deleteUser(id);
	}

	@Auth()
	@Get(':id/courses')
	@ApiOperation({ summary: 'Get user courses' })
	@ApiResponse({ status: 200, description: 'Return user courses.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	getUserCourses(
		@Param('id') id: number,
		@Query() queryCourses: QueryUserCoursesDto,
	): Promise<UserToCourse[]> {
		return this.userService.getUserCourses(queryCourses, id);
	}

	@Auth()
	@Get(':id/groups')
	@ApiOperation({ summary: 'Get user groups' })
	@ApiResponse({ status: 200, description: 'Return user groups.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	getUserGroups(
		@Param('id') id: number,
		@Query() queryGroups: QueryUserGroupsDto,
	): Promise<UserToGroup[]> {
		return this.userService.getUserGroups(queryGroups, id);
	}

	@Auth()
	@Post(':id/groups')
	@ApiOperation({ summary: 'Add user to group' })
	@ApiResponse({ status: 201, description: 'User has been successfully added to group.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	addUserToGroup(
		@Body() userToGroup: UserToGroupDto,
		@UserDecorator() userLoged: User,
	): Promise<UserToGroup> {
		return this.userService.addUserToGroup(userToGroup, userLoged);
	}

	@Auth()
	@Patch(':id/deactivate-assignments')
	@ApiOperation({ summary: 'Deactivate user assignments' })
	@ApiResponse({ status: 200, description: 'User assignments have been successfully deactivated.' })
	@ApiResponse({ status: 404, description: 'User not found.' })
	deactivateUserAssignments(
		@Param('id') id: number,
		@Body() deactivateDto: DeactivateUserAssignmentsDto,
	): Promise<void> {
		return this.userService.deactivateUserAssignments(
			id,
			deactivateDto.assignmentTypes,
		);
	}
}
