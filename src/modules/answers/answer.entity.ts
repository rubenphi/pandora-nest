import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

import { Option } from 'src/modules/options/option.entity';
import { Question } from 'src/modules/questions/question.entity';
import { Group } from 'src/modules/groups/group.entity';
import { User } from 'src/modules/users/user.entity';
import { Institute } from '../institutes/institute.entity';
import { Quiz } from '../quizzes/quiz.entity';

@Entity()
export class Answer {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@ManyToOne(() => Option, (option) => option.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'optionId' })
	option: Option;
	@ManyToOne(() => Question, (question) => question.answers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'questionId' })
	question: Question;

	@ManyToOne(() => Quiz, (quiz) => quiz.answers, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'quizId' })
	quiz: Quiz;

	@ManyToOne(() => Institute, (institute) => institute.answers, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
	@ManyToOne(() => Group, (group) => group.answers, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'groupId' })
	group: Group;
	@ManyToOne(() => User, (user) => user.answers, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	@JoinColumn({ name: 'userId' })
	user: User;
	@Column({
		nullable: false,
		type: 'decimal',
		precision: 50,
		scale: 1,
		default: 0.0,
	})
	points: number;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
