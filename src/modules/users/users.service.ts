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

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,

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
		const institute = await this.instituteRepository.findOneBy({id: userDto.instituteId})
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
		const returnUser = await this.userRepository.save(user);
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
		const institute = await this.instituteRepository.findOneByOrFail({id: userDto.instituteId}).catch(() => {
			throw new NotFoundException('Institute not found');
		});
		const userToUpdate: User = await this.userRepository.preload({
			id: id,
			name: userDto.name,
			institute,
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
		const returnUser = await this.userRepository.save(userToUpdate);
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
