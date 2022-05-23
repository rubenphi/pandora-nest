import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';
import { Lesson } from 'src/modules/lessons/lesson.entity';

@Entity()
export class Area {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	name: string;
	@OneToMany(() => Lesson, (lesson) => lesson.area)
	lessons: Lesson[];
	@Column({ nullable: false }) 
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
