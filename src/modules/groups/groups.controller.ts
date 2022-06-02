import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Patch,
	Delete,
} from '@nestjs/common';

import { Group } from './group.entity';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { Answer } from 'src/modules/answers/answer.entity';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators';

@ApiTags('Groups Routes')
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupService: GroupsService) {}
	@Auth()
	@Get()
	getGroups(): Promise<Group[]> {
		return this.groupService.getGroups();
	}
	@Auth()
	@Get(':id')
	getGroup(@Param('id') id: number): Promise<Group> {
		return this.groupService.getGroup(id);
	}
	@Auth()
	@Post()
	createGroup(@Body() group: CreateGroupDto): Promise<Group> {
		return this.groupService.createGroup(group);
	}
	@Auth()
	@Patch(':id')
	updateGroup(
		@Param('id') id: number,
		@Body() group: UpdateGroupDto,
	): Promise<Group> {
		return this.groupService.updateGroup(id, group);
	}
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
