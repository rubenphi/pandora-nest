import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';

import { Grupo } from 'src/modules/grupos/grupo.entity';
@Entity()
export class Curso {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@Column({ nullable: false })
	exist: boolean;

	@OneToMany(() => Grupo, (grupo) => grupo.curso)
	grupos: Grupo[];

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
