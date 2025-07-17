import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { default as ShortUniqueId } from 'short-unique-id';

import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { User } from '../users/user.entity';
import { Institute } from '../institutes/institute.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { Invitation } from './invitation.entity';
import { QueryInvitationDto } from './dto/query-invitation.dto';
import { Role } from '../auth/roles.decorator';
import { log } from 'console';

@Injectable()
export class InvitationsService {
	/*************  ✨ Codeium Command ⭐  *************/
	/**
	 * Constructor
	 *
	 * @param instituteRepository The typeorm repository for Institute
	 * @param invitationRepository The typeorm repository for Invitation
	 */
	/******  3cbf2732-1d7e-46b2-b966-4d0c5f0f0403  *******/
	constructor(
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Invitation)
		private readonly invitationRepository: Repository<Invitation>,
	) {}

	async create(createInvitationDto: CreateInvitationDto, user: User) {
		const uid = new ShortUniqueId();
		const code = uid.randomUUID(6);

		if (
			user.rol !== Role.Admin &&
			user.institute.id !== createInvitationDto.instituteId
		) {
			throw new ForbiddenException(
				'You are not allowed to create an invitation in this institute',
			);
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
					code: code,
					institute: { id: Not(createInvitationDto.instituteId) },
				},
			})
		) {
			throw new BadRequestException('This code was used');
		}

		const invitation: Invitation = this.invitationRepository.create({
			code,
			valid: createInvitationDto.valid,
			institute,
			expirationDate: createInvitationDto.expirationDate,
			exist: createInvitationDto.exist,
		});

		return await this.invitationRepository.save(invitation);
	}

	async findAll(queryInvitation: QueryInvitationDto): Promise<Invitation[]> {
		if (
			(queryInvitation.initialDate && !queryInvitation.finalDate) ||
			(!queryInvitation.initialDate && queryInvitation.finalDate)
		) {
			throw new BadRequestException(
				'You must specify both initialDate and finalDate',
			);
		}

		if (queryInvitation) {
			return await this.invitationRepository.find({
				where: {
					code: queryInvitation.code,
					expirationDate: Between(
						queryInvitation.initialDate || '2000-01-01',
						queryInvitation.finalDate || '3000-01-01',
					),
					valid: queryInvitation.valid,
					exist: queryInvitation.exist,
					institute: { id: queryInvitation.instituteId },
				},
				relations: ['institute'],
			});
		} else {
			return await this.invitationRepository.find({
				relations: ['institute'],
			});
		}
	}

	async findOne(id: number, user: User) {
		const invitation: Invitation = await this.invitationRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('Group not found');
			});
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== invitation.institute.id
		) {
			throw new ForbiddenException(
				'You are not allowed to see this invitations',
			);
		}
		return invitation;
	}

	async update(
		id: number,
		updateInvitationDto: UpdateInvitationDto,
		user: User,
	) {
		if (
			user.rol !== Role.Admin &&
			user.institute.id !== updateInvitationDto.instituteId
		) {
			throw new ForbiddenException(
				'You are not allowed to update this invitations',
			);
		}
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id: updateInvitationDto.instituteId },
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});

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
			valid: updateInvitationDto.valid,
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
