import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
	OneToMany,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Area } from '../areas/area.entity';
import { Period } from '../periods/period.entity';
import { Course } from '../courses/course.entity';
import { ReinforcementGradableItem } from './reinforcement-gradable-item.entity';
import { Lesson } from '../lessons/lesson.entity';


@Entity()
export class Reinforcement {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'studentId' })
	student: User;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'teacherId' })
	teacher: User;

	@ManyToOne(() => Area)
	@JoinColumn({ name: 'areaId' })
	area: Area;

	@Column({ type: 'float' })
	grade: number;

	@Column()
	year: number;

	@ManyToOne(() => Period)
	@JoinColumn({ name: 'periodId' })
	period: Period;


	@ManyToOne(() => Course)
	@JoinColumn({ name: 'courseId' })
	course: Course;


	@OneToMany(
		() => ReinforcementGradableItem,
		(gradableItem) => gradableItem.gradableType,
	)
	gradableItems: ReinforcementGradableItem[];


	@CreateDateColumn()

	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@ManyToOne(() => Lesson)
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;

}
