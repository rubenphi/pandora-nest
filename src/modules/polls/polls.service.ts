import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Poll } from './poll.entity';
import { PollOption } from './poll-option.entity';
import { PollVote } from './poll-vote.entity';
import { Group } from '../groups/group.entity';
import { Course } from '../courses/course.entity';
import { Period } from '../periods/period.entity';
import { UserToGroup } from '../users/userToGroup.entity';
import { User } from '../users/user.entity';
import { CastVoteDto, CreatePollDto, QueryPollDto, UpdatePollDto } from './dto';
import { Role } from '../auth/roles.decorator';

@Injectable()
export class PollsService {
	constructor(
		@InjectRepository(Poll)
		private readonly pollRepository: Repository<Poll>,
		@InjectRepository(PollOption)
		private readonly pollOptionRepository: Repository<PollOption>,
		@InjectRepository(PollVote)
		private readonly pollVoteRepository: Repository<PollVote>,
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		@InjectRepository(Course)
		private readonly courseRepository: Repository<Course>,
		@InjectRepository(Period)
		private readonly periodRepository: Repository<Period>,
		@InjectRepository(UserToGroup)
		private readonly userToGroupRepository: Repository<UserToGroup>,
	) {}

	async create(createPollDto: CreatePollDto, user: User): Promise<Poll> {
		const course = await this.courseRepository
			.findOneOrFail({ where: { id: createPollDto.courseId } })
			.catch(() => {
				throw new NotFoundException('Course not found');
			});

		const period = await this.periodRepository
			.findOneOrFail({ where: { id: createPollDto.periodId } })
			.catch(() => {
				throw new NotFoundException('Period not found');
			});

		const poll = this.pollRepository.create({
			title: createPollDto.title,
			question: createPollDto.question,
			mode: createPollDto.mode,
			course,
			period,
			year: createPollDto.year,
			creator: user,
			active: true,
		});

		const savedPoll = await this.pollRepository.save(poll);

		// Save options separately after poll is created
		const options = createPollDto.options.map((opt) =>
			this.pollOptionRepository.create({ text: opt.text, poll: savedPoll }),
		);
		savedPoll.options = await this.pollOptionRepository.save(options);

		return savedPoll;
	}

	async findAll(query: QueryPollDto): Promise<Poll[]> {
		const where: any = {};
		if (query.courseId) {
			where.course = { id: Number(query.courseId) };
		}
		if (query.periodId) {
			where.period = { id: Number(query.periodId) };
		}
		if (query.year) {
			where.year = Number(query.year);
		}

		console.log('Querying polls with:', where);

		const polls = await this.pollRepository.find({
			where,
			relations: ['course', 'period', 'creator'],
			order: { createdAt: 'DESC' },
		});

		// Attach options to each poll
		for (const poll of polls) {
			poll.options = await this.pollOptionRepository.find({
				where: { poll: { id: poll.id } },
			});
		}
		return polls;
	}

	async findOne(id: number): Promise<Poll> {
		const poll = await this.pollRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'period', 'creator'],
			})
			.catch(() => {
				throw new NotFoundException('Poll not found');
			});

		poll.options = await this.pollOptionRepository.find({
			where: { poll: { id: poll.id } },
		});

		return poll;
	}

	async close(id: number, user: User): Promise<Poll> {
		const poll = await this.pollRepository
			.findOneOrFail({
				where: { id },
				relations: ['creator'],
			})
			.catch(() => {
				throw new NotFoundException('Poll not found');
			});

		if (
			user.rol !== Role.Admin &&
			user.rol !== Role.Director &&
			user.rol !== Role.Coordinator &&
			user.rol !== Role.Teacher &&
			poll.creator.id !== user.id
		) {
			throw new ForbiddenException('You are not allowed to close this poll');
		}

		if (!poll.active) {
			throw new ConflictException('Poll is already closed');
		}

		poll.active = false;
		poll.closedAt = new Date();
		return this.pollRepository.save(poll);
	}

	async castVote(id: number, castVoteDto: CastVoteDto, user: User): Promise<PollVote> {
		const poll = await this.pollRepository
			.findOneOrFail({
				where: { id },
				relations: ['course', 'period'],
			})
			.catch(() => {
				throw new NotFoundException('Poll not found');
			});

		if (!poll.active) {
			throw new ForbiddenException('This poll is closed and no longer accepts votes');
		}

		const option = await this.pollOptionRepository.findOne({
			where: { id: castVoteDto.optionId, poll: { id } },
		});
		if (!option) {
			throw new NotFoundException('Option not found in this poll');
		}

		let voteGroup: Group | null = null;

		if (poll.mode === 'individual') {
			// Check if YOU already voted
			const existingVote = await this.pollVoteRepository.findOne({
				where: { poll: { id }, user: { id: user.id } },
			});
			if (existingVote) {
				throw new ConflictException('You have already voted in this poll');
			}
		} else {
			// GROUP MODE
			// 1. Find the user's group for this course + period + year
			// Use UserToGroup to find a group that matches the poll's course, period, and year
			// Note: UserToGroup links User <-> Group. Group links to Course, Period. Group has 'year'.
			const userToGroup = await this.userToGroupRepository.findOne({
				where: {
					user: { id: user.id },
					group: {
						course: { id: poll.course.id },
						period: { id: poll.period.id },
						year: poll.year,
						active: true,
					},
					active: true,
				},
				relations: ['group'],
			});

			if (!userToGroup || !userToGroup.group) {
				throw new ForbiddenException(
					'You do not belong to an active group for this course/period, so you cannot vote in a group poll.',
				);
			}

			voteGroup = userToGroup.group;

			// 2. Check if ANYONE in this group has voted
			const existingGroupVote = await this.pollVoteRepository.findOne({
				where: { poll: { id }, group: { id: voteGroup.id } },
			});

			if (existingGroupVote) {
				throw new ConflictException('Your group has already voted in this poll');
			}
		}

		const vote = this.pollVoteRepository.create({
			poll,
			user: user,
			group: voteGroup,
			option,
		});
		return this.pollVoteRepository.save(vote);
	}

	async getMyVote(id: number, user: User): Promise<PollVote | null> {
		const poll = await this.findOne(id);
		
		if (poll.mode === 'individual') {
			return this.pollVoteRepository.findOne({
				where: { poll: { id }, user: { id: user.id } },
				relations: ['option'], 
			}); 
		} else {
			// Group mode: find if MY GROUP voted
			// Need to find my group first, similar to castVote logic
			// But simpler: just check if there's a vote by me OR by my group?
			// Actually, to show "You voted" or "Your group voted", we filter by group.
			
			const userToGroup = await this.userToGroupRepository.findOne({
				where: {
					user: { id: user.id },
					group: {
						course: { id: poll.course.id },
						period: { id: poll.period.id },
						year: poll.year,
						active: true,
					},
				},
				relations: ['group'],
			});

			if (!userToGroup || !userToGroup.group) {
				return null; // Not in a group, so couldn't have voted
			}

			return this.pollVoteRepository.findOne({
				where: { poll: { id }, group: { id: userToGroup.group.id } },
				relations: ['option'],
			});
		}
	}

	async getResults(id: number): Promise<any> {
		const poll = await this.pollRepository
			.findOneOrFail({ where: { id } })
			.catch(() => {
				throw new NotFoundException('Poll not found');
			});

		if (poll.active) {
			throw new ForbiddenException('Results are only available after the poll is closed');
		}

		const options = await this.pollOptionRepository.find({
			where: { poll: { id } },
		});

		const totalVotes = await this.pollVoteRepository.count({
			where: { poll: { id } },
		});

		const results = await Promise.all(
			options.map(async (option) => {
				const count = await this.pollVoteRepository.count({
					where: { poll: { id }, option: { id: option.id } },
				});
				return {
					optionId: option.id,
					text: option.text,
					votes: count,
					percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
				};
			}),
		);

		return {
			pollId: poll.id,
			title: poll.title,
			question: poll.question,
			totalVotes,
			closedAt: poll.closedAt,
			results,
		};
	}

	async update(id: number, updatePollDto: UpdatePollDto, user: User): Promise<Poll> {
		const poll = await this.pollRepository
			.findOneOrFail({
				where: { id },
				relations: ['creator'],
			})
			.catch(() => {
				throw new NotFoundException('Poll not found');
			});

		if (
			user.rol !== Role.Admin &&
			user.rol !== Role.Director &&
			user.rol !== Role.Coordinator &&
			user.rol !== Role.Teacher &&
			poll.creator.id !== user.id
		) {
			throw new ForbiddenException('You are not allowed to update this poll');
		}

		// Apply updates for simple properties
		if (updatePollDto.title !== undefined) poll.title = updatePollDto.title;
		if (updatePollDto.question !== undefined) poll.question = updatePollDto.question;
		if (updatePollDto.mode !== undefined) poll.mode = updatePollDto.mode;
		if (updatePollDto.year !== undefined) poll.year = updatePollDto.year;
		if (updatePollDto.active !== undefined) poll.active = updatePollDto.active;

		// Handle courseId
		if (updatePollDto.courseId !== undefined) {
			const course = await this.courseRepository
				.findOneOrFail({ where: { id: updatePollDto.courseId } })
				.catch(() => {
					throw new NotFoundException('Course not found');
				});
			poll.course = course;
		}

		// Handle periodId
		if (updatePollDto.periodId !== undefined) {
			const period = await this.periodRepository
				.findOneOrFail({ where: { id: updatePollDto.periodId } })
				.catch(() => {
					throw new NotFoundException('Period not found');
				});
			poll.period = period;
		}

		// Handle options
		if (updatePollDto.options !== undefined) {
			// Delete existing options
			await this.pollOptionRepository.delete({ poll: { id: poll.id } });

			// Create and save new options
			const newOptions = updatePollDto.options.map((opt) =>
				this.pollOptionRepository.create({ text: opt.text, poll: poll }),
			);
			poll.options = await this.pollOptionRepository.save(newOptions);
		}

		return this.pollRepository.save(poll);
	}
}
