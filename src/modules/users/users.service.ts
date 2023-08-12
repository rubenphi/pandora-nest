import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';
import { Institute } from '../institutes/institute.entity';
import { Invitation } from '../invitations/invitation.entity';
import { Course } from '../courses/course.entity';
import { UserToCourse } from './userToCourse.entity';
import { QueryUserCoursesDto } from './dto/query-users-courses.dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(Invitation)
		private readonly invitationRepository: Repository<Invitation>,
		@InjectRepository(UserToCourse)
		private readonly userToCourseRepository: Repository<UserToCourse>,

	) {}

	async getUsers(queryUser: QueryUserDto): Promise<User[]> {
		if (Object.entries(queryUser).length != 0) {
			return await this.userRepository.find({
				where: {
					name: queryUser.name ? ILike(`%${queryUser.name}%`) : null,
					lastName: queryUser.lastName
						? ILike(`%${queryUser.lastName}%`)
						: null,
					code: queryUser.code,
					email: queryUser.email,
					exist: queryUser.exist,
					institute: { id: queryUser.instituteId}
				},
				relations: ['institute'],
			});
		} else {
			return await this.userRepository.find();
		}
	}

	async getUserCourses(queryCourses: QueryUserCoursesDto, id:number): Promise<UserToCourse[]> {
		if (Object.entries(queryCourses).length != 0) {
			return await this.userToCourseRepository.find({
				where: {
				year: queryCourses.year,
				user: {id}

				},
				relations: ['course'],
			});
		} else {
			throw new ForbiddenException('userId is required');
		}
	}

	async getUserByCode(code: string, user?: User, ) {
		const userToReturn = await this.userRepository
		.createQueryBuilder('user')
		.leftJoinAndSelect('user.institute', 'institute')
		.where({ code })
		.addSelect('user.password')
		.getOne()

		if(user && user.institute.id !== userToReturn.institute.id)
		{throw new ForbiddenException('You are not allowed to see this user')}
		
		
		return userToReturn ;
	}
	async getUser(id: number, user?: User): Promise<User> {
		const userToReturn: User = await this.userRepository
			.findOneOrFail({
				where: { id },
				relations: ['institute'],
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});
			if(user && user.institute.id !== userToReturn.institute.id)
			{throw new ForbiddenException('You are not allowed to see this user')}
		return userToReturn;
	}
	async createUser(userDto: CreateUserDto): Promise<User> {
		const sameEmail = await this.userRepository.findOne({
			where: { email: userDto.email },
		});
		const sameCode = await this.userRepository.findOne({
			where: { code: userDto.code },
		});

		if (sameEmail && userDto.email) {
			throw new BadRequestException(
				'You cannot create two users with the same email',
			);
		} else if (sameCode) {
			throw new BadRequestException(
				'You cannot create two users with the same code',
			);
		}
		const invitation: Invitation = await this.invitationRepository.findOne({where: { code: userDto.instituteInvitation, valid: true}, relations: ['institute']})
		const institute = invitation.institute
		const user: User = await this.userRepository.create({
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			institute,
			password: userDto.password,
			rol: 'user',
			exist: userDto.exist,
		});
		const returnUser = await this.userRepository.save(user).then(
			async (user) => {await this.invitationRepository.update(invitation.id, {valid: false})
			return user
			}

		);
		delete returnUser.password;
		return returnUser;
	}
	async updateUser(id: number, userDto: UpdateUserDto, user: User): Promise<User> {
		if(user.id !== id)
		{throw new ForbiddenException('You are not allowed to update this user')}
		 
		const sameEmail = await this.userRepository.findOne({
			where: { email: userDto.email, id: Not(id) },
		});
		const sameCode = await this.userRepository.findOne({
			where: { code: userDto.code, id: Not(id) },
		});

		if (sameEmail && userDto.email) {
			throw new BadRequestException(
				'You cannot create two users with the same email',
			);
		} else if (sameCode) {
			throw new BadRequestException(
				'You cannot create two users with the same code',
			);
		}
		const invitation: Invitation = await this.invitationRepository.findOne({where: { code: userDto.instituteInvitation, valid: true}, relations: ['institute']})
		const userToUpdate: User = await this.userRepository.preload({
			id: id,
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			rol: userDto.rol,
			password: userDto.password,
			exist: userDto.exist,
		});

		if (!userToUpdate) {
			throw new NotFoundException('The user you want to update does not exist');
		}
		if(invitation){
			userToUpdate.institute = invitation.institute
	   }
		const returnUser = await this.userRepository.save(userToUpdate).then(
			async (user) => {await this.invitationRepository.update(invitation.id, {valid: false})
			return user
			}

		);
		delete returnUser.password;
		return returnUser;
	}

	async deleteUser(id: number): Promise<void> {
		const user: User = await this.userRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException(
					'The user you want to delete does not exist',
				);
			});
		this.userRepository.remove(user);
	}
}
