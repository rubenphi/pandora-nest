import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
	Query,
} from '@nestjs/common';

import { Group } from './group.entity';
import { GroupsService } from './groups.service';
import { CreateGroupDto, QueryGroupDto, UpdateGroupDto } from './dto';
import { Answer } from 'src/modules/answers/answer.entity';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth, User } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
import { User as UserEntity } from '../users/user.entity';
import { UserToGroup } from '../users/userToGroup.entity';
import { AddUserToGroupDto } from './dto/add-user.dto';
import { RemoveUserFromGroupDto } from './dto/remove-users.dto';
import { UpdateUserFromGroupDto } from './dto/update-users.dto';

@ApiTags('Groups Routes')
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupService: GroupsService) {}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all groups' })
	@ApiResponse({ status: 200, description: 'Return all groups.' })
	getGroups(
		@Query() queryGroupDto: QueryGroupDto,
		@User() user: UserEntity,
	): Promise<Group[]> {
		return this.groupService.getGroups(queryGroupDto, user);
	}
	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a group by id' })
	@ApiResponse({ status: 200, description: 'Return a group.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	getGroup(@Param('id') id: number, @User() user: UserEntity): Promise<Group> {
		return this.groupService.getGroup(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a group' })
	@ApiResponse({ status: 201, description: 'The group has been successfully created.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	createGroup(
		@Body() group: CreateGroupDto,
		@User() user: UserEntity,
	): Promise<Group> {
		return this.groupService.createGroup(group, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a group' })
	@ApiResponse({ status: 200, description: 'The group has been successfully updated.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	updateGroup(
		@Param('id') id: number,
		@Body() group: UpdateGroupDto,
		@User() user: UserEntity,
	): Promise<Group> {
		return this.groupService.updateGroup(id, group, user);
	}
	@Roles(Role.Admin)
	@Auth()
	@Delete(':id')
	@ApiOperation({ summary: 'Delete a group' })
	@ApiResponse({ status: 200, description: 'The group has been successfully deleted.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	deleteGroup(@Param('id') id: number): Promise<void> {
		return this.groupService.deleteGroup(id);
	}

	@Auth()
	@Get(':id/answers')
	@ApiOperation({ summary: 'Get answers by group' })
	@ApiResponse({ status: 200, description: 'Return answers.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	getAnswersByGroup(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer[]> {
		return this.groupService.getAnswersByGroup(id, user);
	}

	@Auth()
	@Get(':id/:year/users')
	@ApiOperation({ summary: 'Get users by group' })
	@ApiResponse({ status: 200, description: 'Return users.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	getUsersByGroup(
		@Param('id') id: number,
		@Param('year') year: number,
		@User() user: UserEntity,
	): Promise<UserToGroup[]> {
		return this.groupService.getUsersByGroup(id, year, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@ApiBody({ type: [AddUserToGroupDto] })
	@Post(':id/users')
	@ApiOperation({ summary: 'Add user to group' })
	@ApiResponse({ status: 201, description: 'User has been successfully added to group.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	addUserToGroup(
		@Param('id') id: number,
		@Body() usersToAdd: AddUserToGroupDto[],
		@User() user: UserEntity,
	): Promise<UserToGroup[]> {
		return this.groupService.addUserToGroup(id, usersToAdd, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id/users')
	@ApiOperation({ summary: 'Update user from group' })
	@ApiResponse({ status: 200, description: 'User has been successfully updated from group.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	updateUserFromGroup(
		@Param('id') id: number,
		@Body() usersToRemove: UpdateUserFromGroupDto,
		@User() user: UserEntity,
	): Promise<UserToGroup> {
		return this.groupService.updateUserFromGroup(id, usersToRemove, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Delete(':id/users')
	@ApiOperation({ summary: 'Remove user from group' })
	@ApiResponse({ status: 200, description: 'User has been successfully removed from group.' })
	@ApiResponse({ status: 404, description: 'Group not found.' })
	removeUserFromGroup(
		@Param('id') id: number,
		@Body() usersToRemove: RemoveUserFromGroupDto,
		@User() user: UserEntity,
	): Promise<UserToGroup> {
		return this.groupService.removeUserFromGroup(id, usersToRemove, user);
	}
}
