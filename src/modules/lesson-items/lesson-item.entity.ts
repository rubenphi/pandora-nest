import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';

export enum ContentType {
	QUIZ = 'QUIZ',
	ACTIVITY = 'ACTIVITY',
	MATERIAL = 'MATERIAL',
}

@Entity({ name: 'lesson_items' })
export class LessonItem {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => Lesson, (lesson) => lesson.items)
	lesson: Lesson;

	@Column()
	order: number;

	@Column({ type: 'enum', enum: ContentType })
	contentType: ContentType;

	@Column('int')
	contentId: number;

	@ManyToOne(() => Institute, (institute) => institute.lessonItems)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
