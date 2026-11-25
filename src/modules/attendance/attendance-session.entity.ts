import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Course } from '../courses/course.entity';
import { Lesson } from '../lessons/lesson.entity';
import { Institute } from '../institutes/institute.entity';
import { User } from '../users/user.entity';
import { AttendanceRecord } from './attendance-record.entity';

export enum AttendanceScope {
	GENERAL = 'general',
	LESSON = 'lesson',
}

@Entity('attendance_sessions')
export class AttendanceSession {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({
		type: 'simple-enum',
		enum: AttendanceScope,
		default: AttendanceScope.GENERAL,
	})
	scope: AttendanceScope;

	@Column({ type: 'varchar', length: 10 })
	date: string; // YYYY-MM-DD

	@Column({ type: 'varchar', length: 10, nullable: true })
	closingTime: string | null; // HH:mm (cierre de jornada o fin de clase)

	@Column({ type: 'int' })
	year: number;

	@ManyToOne(() => Course, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'courseId' })
	course: Course;

	@ManyToOne(() => Lesson, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson | null;

	@ManyToOne(() => Institute, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;

	@ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
	@JoinColumn({ name: 'authorId' })
	author: User | null;

	@OneToMany(() => AttendanceRecord, (record) => record.session, {
		cascade: true,
	})
	records: AttendanceRecord[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
