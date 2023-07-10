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
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';

@ApiTags('Groups Routes')
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupService: GroupsService) {}
	@Auth()
	@Get()
	getGroups(@Query() queryGroupDto: QueryGroupDto): Promise<Group[]> {
		return this.groupService.getGroups(queryGroupDto);
	}
	@Auth()
	@Get(':id')
	getGroup(@Param('id') id: number): Promise<Group> {
		return this.groupService.getGroup(id);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	createGroup(@Body() group: CreateGroupDto): Promise<Group> {
		return this.groupService.createGroup(group);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	updateGroup(
		@Param('id') id: number,
		@Body() group: UpdateGroupDto,
	): Promise<Group> {
		return this.groupService.updateGroup(id, group);
	}
	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Delete(':id')
	deleteGroup(@Param('id') id: number): Promise<void> {
		return this.groupService.deleteGroup(id);
	}
	@Auth()
	@Get(':id')
	getAnswersByGroup(@Param('id') id: number): Promise<Answer[]> {
		return this.groupService.getAnswersByGroup(id);
	}
}
