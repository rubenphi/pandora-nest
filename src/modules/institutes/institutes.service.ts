import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Institute } from './institute.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	CreateInstituteDto,
	UpdateInstituteDto,
	QueryInstituteDto,
} from './dto';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class InstitutesService {
	constructor(
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async getInstitutes(queryInstitute: QueryInstituteDto): Promise<Institute[]> {
		if (queryInstitute) {
			return await this.instituteRepository.find({
				where: {
					name: queryInstitute.name ? ILike(`%${queryInstitute.name}%`) : null,
					exist: queryInstitute.exist,
					
				},
				relations: ['owner']
			});
		} else {
			return await this.instituteRepository.find();
		}
	}
	async getInstitute(id: number): Promise<Institute> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
				relations: ['owner']
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute;
	}
	
	async createInstitute(instituteDto: CreateInstituteDto, user: User): Promise<Institute> {
		const { institute, ...userWithoutInstitute } = user
		console.log(user);
		
		const instituteToSave: Institute = await this.instituteRepository.create({
			name: instituteDto.name,
			exist: instituteDto.exist,
			owner: userWithoutInstitute 
		});
		const respuesta = await this.instituteRepository.save(instituteToSave)
		await this.userRepository.update(user.id, {rol: Role.Director, institute: instituteToSave})
		return respuesta;
	}
	async updateInstitute(
		id: number,
		instituteDto: UpdateInstituteDto,
		user: User,
	): Promise<Institute> {
		if (user.rol !== Role.Admin && user.institute.id !== id)
			throw new NotFoundException(
				'You are not allowed to update this institute',
			);

		
		const institute: Institute = await this.instituteRepository.preload({
			id: id,
			name: instituteDto.name,
			exist: instituteDto.exist,
		});
		if (!institute) {
			throw new NotFoundException(
				'The institute you want to update does not exist',
			);
		}
		if (instituteDto.ownerId){
			const owner: User = await this.userRepository.findOneByOrFail({id: instituteDto.ownerId}).catch(() => {
				throw new NotFoundException('User not found');
			});
			institute.owner = owner
			await this.userRepository.update(instituteDto.ownerId, {rol: Role.Director})
		}
		
		return this.instituteRepository.save(institute);
	}

	async deleteInstitute(id: number): Promise<void> {
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The institute you want to delete does not exist',
				);
			});

		this.instituteRepository.remove(institute);
	}

	async getLessonsByInstitute(id: number, user: User): Promise<Lesson[]> {
		if (user.institute.id !== id)
			throw new NotFoundException(
				'You are not allowed to see lessons of this institute',
			);
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
				relations: ['lessons'],
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute.lessons;
	}

	async getCoursesByInstitute(id: number, user: User): Promise<Course[]> {
		if (user.institute.id !== id)
			throw new NotFoundException(
				'You are not allowed to see courses of this institute',
			);
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
				relations: ['courses'],
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute.courses;
	}

	async getGroupsByInstitute(id: number, user: User): Promise<Group[]> {
		if (user.institute.id !== id)
			throw new NotFoundException(
				'You are not allowed to see groups of this institute',
			);
		const institute: Institute = await this.instituteRepository
			.findOneOrFail({
				where: { id },
				relations: ['groups'],
			})
			.catch(() => {
				throw new NotFoundException('Institute not found');
			});
		return institute.groups;
	}
}
