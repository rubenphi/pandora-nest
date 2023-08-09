import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Institute } from '../institutes/institute.entity';
import { Invitation } from './invitation.entity';

@Module({
  imports: [
		TypeOrmModule.forFeature([
      Invitation,
			Institute,
		]),
	],
  controllers: [InvitationsController],
  providers: [InvitationsService]
})
export class InvitationsModule {}
