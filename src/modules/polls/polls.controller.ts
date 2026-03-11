import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PollsService } from './polls.service';
import { CastVoteDto, CreatePollDto, QueryPollDto, UpdatePollDto } from './dto';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';
import { Roles, Role } from '../auth/roles.decorator';

@ApiTags('polls')
@Controller('polls')
export class PollsController {
	constructor(private readonly pollsService: PollsService) {}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post()
	@ApiOperation({ summary: 'Create a new poll' })
	@ApiResponse({ status: 201, description: 'Poll created successfully.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	create(@Body() createPollDto: CreatePollDto, @User() user: UserEntity) {
		return this.pollsService.create(createPollDto, user);
	}

	@Auth()
	@Get()
	@ApiOperation({ summary: 'Get all polls (optionally filtered by groupId)' })
	@ApiResponse({ status: 200, description: 'Return polls.' })
	findAll(@Query() query: QueryPollDto) {
		return this.pollsService.findAll(query);
	}

	@Auth()
	@Get(':id')
	@ApiOperation({ summary: 'Get a poll by id' })
	@ApiResponse({ status: 200, description: 'Return poll.' })
	@ApiResponse({ status: 404, description: 'Poll not found.' })
	findOne(@Param('id') id: number) {
		return this.pollsService.findOne(id);
	}

	@Auth()
	@Patch(':id/close')
	@ApiOperation({ summary: 'Close a poll' })
	@ApiResponse({ status: 200, description: 'Poll closed successfully.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Poll not found.' })
	close(@Param('id') id: number, @User() user: UserEntity) {
		return this.pollsService.close(id, user);
	}

	@Auth()
	@Post(':id/vote')
	@ApiOperation({ summary: 'Cast a vote in a poll' })
	@ApiResponse({ status: 201, description: 'Vote registered.' })
	@ApiResponse({ status: 409, description: 'Already voted.' })
	@ApiResponse({ status: 403, description: 'Poll is closed.' })
	castVote(
		@Param('id') id: number,
		@Body() castVoteDto: CastVoteDto,
		@User() user: UserEntity,
	) {
		return this.pollsService.castVote(id, castVoteDto, user);
	}

	@Auth()
	@Get(':id/my-vote')
	@ApiOperation({ summary: 'Check if the current user has voted' })
	@ApiResponse({ status: 200, description: 'Returns the vote or null.' })
	getMyVote(@Param('id') id: number, @User() user: UserEntity) {
		return this.pollsService.getMyVote(id, user);
	}

	@Auth()
	@Get(':id/results')
	@ApiOperation({ summary: 'Get poll results (only available when poll is closed)' })
	@ApiResponse({ status: 200, description: 'Return results.' })
	@ApiResponse({ status: 403, description: 'Poll is still active.' })
	getResults(@Param('id') id: number) {
		return this.pollsService.getResults(id);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Patch(':id')
	@ApiOperation({ summary: 'Update a poll' })
	@ApiResponse({ status: 200, description: 'Poll updated successfully.' })
	@ApiResponse({ status: 403, description: 'Forbidden.' })
	@ApiResponse({ status: 404, description: 'Poll not found.' })
	update(
		@Param('id') id: number,
		@Body() updatePollDto: UpdatePollDto,
		@User() user: UserEntity,
	) {
		return this.pollsService.update(id, updatePollDto, user);
	}
}
