import { Question } from '../questions/question.entity';
import { Lesson } from '../lessons/lesson.entity';
import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Institute } from '../institutes/institute.entity';
import { Grade } from '../grades/grade.entity';
import { Answer } from '../answers/answer.entity';

@Entity({ name: 'quizzes' })
export class Quiz {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	title: string;

	@Column({ type: 'enum', enum: ['group', 'individual'], default: 'group' })
	quizType: 'group' | 'individual';

	@Column({
		type: 'enum',
		enum: ['knowledge', 'execution', 'behavior'],
		default: 'knowledge',
	})
	classification: 'knowledge' | 'execution' | 'behavior';

	@OneToMany(() => Question, (question) => question.quiz)
	questions: Question[];

	@OneToMany(() => Answer, (answer) => answer.quiz)
	answers: Answer[];

	@ManyToOne(() => Lesson, (lesson) => lesson.quizzes)
	@JoinColumn({ name: 'lessonId' })
	lesson: Lesson;

	//default: 1
	@ManyToOne(() => Institute, (institute) => institute.quizzes)
	@JoinColumn({ name: 'instituteId' })
	institute: Institute;
}
