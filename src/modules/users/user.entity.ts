import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	BeforeInsert,
	BeforeUpdate,
	JoinTable,
	ManyToOne,
} from 'typeorm';
import { Lesson } from 'src/modules/lessons/lesson.entity';
import { UserToCourse } from './userToCourse.entity';
import { UserToGroup } from './userToGroup.entity';
import { Answer } from 'src/modules/answers/answer.entity';
import { hash } from 'bcryptjs';
import { Institute } from '../institutes/institute.entity';
import { StudentCriterionScore } from '../student-criterion-scores/student-criterion-score.entity';
//estamos en autenticacion
@Entity()
export class User {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@Column({ nullable: false })
	lastName: string;
	@Column({ nullable: true })
	email: string;
	@Column({ nullable: false })
	code: string;
	@ManyToOne(() => Institute)
	@JoinTable({ name: 'instituteId' })
	institute: Institute;
	@Column({ nullable: false })
	exist: boolean;
	@Column({ nullable: false, default: 'user' })
	rol: string;
	@Column({ nullable: false, select: false })
	password: string;
	@OneToMany(() => Lesson, (lesson) => lesson.author)
	lessons: Lesson[];
	@OneToMany(() => UserToCourse, (userToCourse) => userToCourse.user)
	courses: UserToCourse[];
	@OneToMany(() => UserToGroup, (userToGroup) => userToGroup.user)
	groups: UserToGroup[];
	@OneToMany(() => Answer, (answer) => answer.user)
	answers: Answer[];

	@OneToMany(() => StudentCriterionScore, (score) => score.student)
	studentCriterionScores: StudentCriterionScore[];

	@OneToMany(() => StudentCriterionScore, (score) => score.gradedBy)
	gradedCriterionScores: StudentCriterionScore[];
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
	@BeforeInsert()
	@BeforeUpdate()
	async hashPassword() {
		if (!this.password) {
			return;
		}
		this.password = await hash(this.password, 10);
	}
}
