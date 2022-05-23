import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto, QueryUserDto } from './dto';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async getUsers(queryUser: QueryUserDto): Promise<User[]> {
		if (queryUser) {
			return await this.userRepository.find({
				where: { name: queryUser.name, exist: queryUser.exist },
			});
		} else {
			return await this.userRepository.find();
		}
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
		const user: User = await this.userRepository.create({
			name: userDto.name,
			exist: userDto.exist,
		});
		return this.userRepository.save(user);
	}
	async updateUser(id: number, userDto: UpdateUserDto): Promise<User> {
		const user: User = await this.userRepository.preload({
			id: id,
			name: userDto.name,
			exist: userDto.exist,
		});
		if (!user) {
			throw new NotFoundException('The user you want to update does not exist');
		}
		return this.userRepository.save(user);
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
