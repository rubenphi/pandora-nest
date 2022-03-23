import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Curso {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column()
	exist: boolean;
}
