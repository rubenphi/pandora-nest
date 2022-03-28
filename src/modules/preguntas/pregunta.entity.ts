import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';

import { Cuestionario } from 'src/modules/cuestionarios/cuestionario.entity';

@Entity()
export class Pregunta {
	@PrimaryGeneratedColumn('increment')
	id: number;
	@Column({ nullable: false })
	title: string;
	@Column({ nullable: false })
	enunciado: string;
	@ManyToOne(() => Cuestionario, (cuestionario) => cuestionario.preguntas, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'cuestionario_id' })
	cuestionario: Cuestionario;
	@Column()
	photo: string;
	@Column({ nullable: false })
	visible: boolean;
	@Column({ nullable: false })
	disponible: boolean;
	@Column({ nullable: false })
	exist: boolean;
	@CreateDateColumn()
	createdAt: Date;
	@UpdateDateColumn()
	updatedAt: Date;
}
