import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';

import { Curso } from 'src/modules/cursos/curso.entity';
import { Pregunta } from 'src/modules/preguntas/pregunta.entity';

@Entity()
export class Cuestionario {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	theme: string;
	@Column({ nullable: false })
	date: Date;
	@ManyToOne(() => Curso, (curso) => curso.grupos, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'curso_id' })
	curso: Curso;
	@OneToMany(() => Pregunta, (pregunta) => pregunta.cuestionario)
	preguntas: Pregunta[];
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
