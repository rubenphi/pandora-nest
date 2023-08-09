import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { User } from '../users/user.entity';
import { Institute } from '../institutes/institute.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { Invitation } from './invitation.entity';
import { QueryInvitationDto } from './dto/query-invitation.dto';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(Institute)
  private readonly instituteRepository: Repository<Institute>,
  @InjectRepository(Invitation)
  private readonly invitationRepository: Repository<Invitation>,){}

  async create(createInvitationDto: CreateInvitationDto, user: User) {
    if (user.rol !== Role.Admin && user.institute.id !== createInvitationDto.instituteId)  {
			throw new ForbiddenException('You are not allowed to create an invitation in this institute');
		}
    const institute: Institute = await this.instituteRepository
    .findOneOrFail({
      where: { id: createInvitationDto.instituteId },
    })
    .catch(() => {
      throw new NotFoundException('Institute not found');
    });

    if (
			await this.invitationRepository.findOne({
				where: {
					code: createInvitationDto.code,
          institute: { id: Not(createInvitationDto.instituteId) }
				},
			})
		) {
			throw new BadRequestException('This code was used');
		}

    const invitation: Invitation = this.invitationRepository.create({
      active: createInvitationDto.active,
      institute,
      expirationDate: createInvitationDto.expirationDate,
      exist: createInvitationDto.exist,
    });

    return await this.invitationRepository.save(invitation);
  }

  async findAll(queryInvitation: QueryInvitationDto): Promise<Invitation[]>{
    if((queryInvitation.initialDate && !queryInvitation.finalDate) || (!queryInvitation.initialDate && queryInvitation.finalDate) )
    {
      throw new BadRequestException('You must specify both initialDate and finalDate');
    }

    if (queryInvitation) {
			return await this.invitationRepository.find({
				where: {
          expirationDate: Between(queryInvitation.initialDate, queryInvitation.finalDate),
          active: queryInvitation.active,
          exist: queryInvitation.exist,
          institute: { id: queryInvitation.instituteId}
				},
				relations: ['institute'],
			});
		} else {
			return await this.invitationRepository.find({
				relations: [ 'institute'],
			});
		}
   
  }

  async findOne(id: number, user: User) {
    const invitation: Invitation = await this.invitationRepository
			.findOneOrFail({
				where: { id },
				relations: [ 'institute'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		if (user.rol !== Role.Admin && user.institute.id !== invitation.institute.id) {
			throw new ForbiddenException('You are not allowed to see this group');
		}
    return invitation
  }

  async update(id: number, updateInvitationDto: UpdateInvitationDto, user: User) {
    if (user.rol !== Role.Admin && user.institute.id !== updateInvitationDto.instituteId) {
			throw new ForbiddenException('You are not allowed to update this group');
		}
    const institute: Institute = await this.instituteRepository
    .findOneOrFail({
      where: { id: updateInvitationDto.instituteId },
    })
    .catch(() => {
      throw new NotFoundException('Institute not found');
    })

    if (
			await this.invitationRepository.findOne({
				where: {
					code: updateInvitationDto.code,
          institute: { id: Not(updateInvitationDto.instituteId) },
					id: Not(id),
				},
			})
		) {
			throw new BadRequestException('This code was used');
		}

    const group: Invitation = await this.invitationRepository.preload({
			id: id,
			active: updateInvitationDto.active,
      institute,
      expirationDate: updateInvitationDto.expirationDate,
      exist: updateInvitationDto.exist,
		});
		if (!group) {
			throw new NotFoundException(
				'The group you want to update does not exist',
			);
		}
		return this.invitationRepository.save(group);
  }

  async remove(id: number) {
    const invitation: Invitation = await this.invitationRepository
    .findOneOrFail({
      where: { id },
    })
    .catch(() => {
      throw new NotFoundException(
        'The period you want to delete does not exist',
      );
    });
  this.invitationRepository.remove(invitation);
  }
}
