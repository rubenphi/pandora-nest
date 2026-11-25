import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn,
} from 'typeorm';
import { AttendanceSession } from './attendance-session.entity';
import { User } from '../users/user.entity';

export enum AttendanceStatus {
	PRESENT = 'present',
	ABSENT = 'absent',
	EXCUSED = 'excused',
	LATE = 'late',
	EARLY_EXIT = 'early_exit',
}

@Entity('attendance_records')
export class AttendanceRecord {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@ManyToOne(() => AttendanceSession, (session) => session.records, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'sessionId' })
	session: AttendanceSession;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'studentId' })
	student: User;

	@Column({
		type: 'simple-enum',
		enum: AttendanceStatus,
		default: AttendanceStatus.ABSENT,
	})
	status: AttendanceStatus;

	@Column({ type: 'varchar', length: 10, nullable: true })
	eventTime: string | null; // HH:mm para salida inesperada o retardo

	@Column({ type: 'boolean', default: false })
	scannedByMarker: boolean;

	@Column({ type: 'text', nullable: true })
	note: string | null;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
