import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { Auth, User } from 'src/common/decorators';
import { User as UserEntity } from '../users/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { Role, Roles } from '../auth/roles.decorator';
import { QueryInvitationDto } from './dto/query-invitation.dto';

@ApiTags('Invitations Routes')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Roles(Role.Admin, Role.Director)
	@Auth()
  @Post()
  create(@Body() createInvitationDto: CreateInvitationDto, @User() user: UserEntity) {
    return this.invitationsService.create(createInvitationDto, user);
  }

  @Roles(Role.Admin)
	@Auth()
  @Get()
  findAll(@Query() queryInvitationDto: QueryInvitationDto) {
    return this.invitationsService.findAll(queryInvitationDto);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id') id: number, @User() user: UserEntity) {
    return this.invitationsService.findOne(id, user);
  }

  @Roles(Role.Admin, Role.Director)
	@Auth()
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateInvitationDto: UpdateInvitationDto, @User() user: UserEntity)  {
    return this.invitationsService.update(id, updateInvitationDto, user);
  }

  @Roles(Role.Admin)
	@Auth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.invitationsService.remove(id);
  }
}
