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
@Controller('groups')
export class GroupsController {
	constructor(private readonly groupService: GroupsService) {}
	@Get()
	getGroups(): Promise<Group[]> {
		return this.groupService.getGroups();
	}
	@Get(':id')
	getGroup(@Param('id') id: number): Promise<Group> {
		return this.groupService.getGroup(id);
	}

	@Post()
	createGroup(@Body() group: CreateGroupDto): Promise<Group> {
		return this.groupService.createGroup(group);
	}

	@Patch(':id')
	updateGroup(
		@Param('id') id: number,
		@Body() group: UpdateGroupDto,
	): Promise<Group> {
		return this.groupService.updateGroup(id, group);
	}
	@Delete(':id')
	deleteGroup(@Param('id') id: number): Promise<void> {
		return this.groupService.deleteGroup(id);
	}
}
