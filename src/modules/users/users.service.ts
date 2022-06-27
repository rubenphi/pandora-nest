import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, ILike } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async getUsers(queryUser: QueryUserDto): Promise<User[]> {
		
	
		if (Object.entries(queryUser).length != 0) {
			return await this.userRepository.find({
				where: {
					name: queryUser.name ? ILike(`%${queryUser.name}%`): null,
					lastName: queryUser.lastName ? ILike(`%${queryUser.lastName}%`): null,
					code: queryUser.code,
					email: queryUser.email,
					exist: queryUser.exist,
				
			}});
		
		} else {
			return await this.userRepository.find();
		}
	}

	async getUserByCode(code: string) {
		return await this.userRepository
			.createQueryBuilder('user')
			.where({ code })
			.addSelect('user.password')
			.getOne();
	}
	async getUser(id: number): Promise<User> {
		const user: User = await this.userRepository
			.findOneOrFail({
				where: { id },
			})
			.catch(() => {
				throw new NotFoundException('User not found');
			});
		return user;
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
		const user: User = await this.userRepository.create({
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			password: userDto.password,
			exist: userDto.exist,
		});
		const returnUser = await this.userRepository.save(user);
		delete returnUser.password;
		return returnUser;
	}
	async updateUser(id: number, userDto: UpdateUserDto): Promise<User> {
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
		const user: User = await this.userRepository.preload({
			id: id,
			name: userDto.name,
			lastName: userDto.lastName,
			email: userDto.email,
			code: userDto.code,
			password: userDto.password,
			exist: userDto.exist,
		});
		if (!user) {
			throw new NotFoundException('The user you want to update does not exist');
		}
		const returnUser = await this.userRepository.save(user);
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
