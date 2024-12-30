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
import { ApiBody, ApiTags } from '@nestjs/swagger';
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
	getGroups(
		@Query() queryGroupDto: QueryGroupDto,
		@User() user: UserEntity,
	): Promise<Group[]> {
		return this.groupService.getGroups(queryGroupDto, user);
	}
	@Auth()
	@Get(':id')
	getGroup(@Param('id') id: number, @User() user: UserEntity): Promise<Group> {
		return this.groupService.getGroup(id, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	createGroup(
		@Body() group: CreateGroupDto,
		@User() user: UserEntity,
	): Promise<Group> {
		return this.groupService.createGroup(group, user);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
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
	deleteGroup(@Param('id') id: number): Promise<void> {
		return this.groupService.deleteGroup(id);
	}

	@Auth()
	@Get(':id')
	getAnswersByGroup(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<Answer[]> {
		return this.groupService.getAnswersByGroup(id, user);
	}

	@Auth()
	@Get(':id/users')
	getUsersByGroup(
		@Param('id') id: number,
		@User() user: UserEntity,
	): Promise<UserToGroup[]> {
		return this.groupService.getUsersByGroup(id, user);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@ApiBody({ type: [AddUserToGroupDto] })
	@Post(':id/users')
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
	removeUserFromGroup(
		@Param('id') id: number,
		@Body() usersToRemove: RemoveUserFromGroupDto,
		@User() user: UserEntity,
	): Promise<UserToGroup> {
		return this.groupService.removeUserFromGroup(id, usersToRemove, user);
	}
}
