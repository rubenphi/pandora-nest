import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Answer } from '../answers/answer.entity';
import { Area } from '../areas/area.entity';
import { Course } from '../courses/course.entity';
import { Group } from '../groups/group.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Option } from '../options/option.entity';
import { Period } from '../periods/period.entity';
import { Question } from '../questions/question.entity';
import { User } from '../users/user.entity';
import { Invitation } from '../invitations/invitation.entity';
import { Quiz } from '../quizzes/quiz.entity';
import { Material } from '../materials/material.entity';
import { LessonItem } from '../lesson-items/lesson-item.entity';
import { Activity } from '../activities/activity.entity';
import { Criterion } from '../criteria/criterion.entity';
import { Grade } from '../grades/grade.entity';
import { UserToCourse } from '../users/userToCourse.entity';
import { UserToGroup } from '../users/userToGroup.entity';

@Entity()
export class Institute {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@OneToMany(() => Answer, (answer) => answer.institute)
	answers: Answer[];
	@OneToMany(() => Course, (course) => course.institute)
	courses: Course[];
	@OneToMany(() => Area, (area) => area.institute)
	areas: Area[];
	@OneToMany(() => Group, (group) => group.institute)
	groups: Group[];
	@OneToMany(() => Lesson, (lesson) => lesson.institute)
	lessons: Lesson[];
	@OneToMany(() => Option, (option) => option.institute)
	options: Option[];
	@OneToMany(() => Period, (period) => period.institute)
	periods: Period[];
	@OneToMany(() => Question, (question) => question.institute)
	questions: Question[];
	@OneToMany(() => Quiz, (quiz) => quiz.institute)
	quizzes: Quiz[];
	@OneToMany(() => Material, (material) => material.institute)
	materials: Material[];
	@OneToMany(() => LessonItem, (lessonItem) => lessonItem.institute)
	lessonItems: LessonItem[];
	@OneToMany(() => Invitation, (invitation) => invitation.institute)
	invitations: Invitation[];
	@OneToMany(() => User, (user) => user.institute)
	users: User[];
	@OneToMany(() => Activity, (activity) => activity.institute)
	activities: Activity[];
	@OneToMany(() => Criterion, (criterion) => criterion.institute)
	criteria: Criterion[];
	@OneToMany(() => Grade, (grade) => grade.institute)
	grades: Grade[];
	@ManyToOne(() => User, (user) => user.institute, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'userId' })
	owner: User;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
