import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

import { Curso } from 'src/modules/cursos/curso.entity';

@Entity()
export class Grupo {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	nombre: string;
	@ManyToOne(() => Curso, (curso) => curso.grupos, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'curso_id' })
	curso: Curso;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
