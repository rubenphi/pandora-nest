import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Institute } from '../modules/institutes/institute.entity';
import { Role } from '../modules/auth/roles.decorator';
import { SurveyTemplate } from '../modules/surveys/survey-template.entity';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class AppInitializerService implements OnApplicationBootstrap {
	private readonly logger = new Logger(AppInitializerService.name);

	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Institute)
		private readonly instituteRepository: Repository<Institute>,
		@InjectRepository(SurveyTemplate)
		private readonly templateRepository: Repository<SurveyTemplate>,
	) {}

	async onApplicationBootstrap() {
		try {
			const count = await this.userRepository.count();
			this.logger.log(`Total usuarios en base de datos: ${count}`);

			if (count === 0) {
				this.logger.log(
					'Base de datos vacía detectada. Inicializando datos por defecto para primer uso...',
				);
				await this.seedInitialData();
			} else {
				// Asegurar que el usuario ADM001 tenga contraseña 'admin' válida aunque haya sido doble-hasheada previamente
				const admin = await this.userRepository
					.createQueryBuilder('user')
					.where('user.code = :code OR user.email = :email', {
						code: 'ADM001',
						email: 'admin@pandora.local',
					})
					.addSelect('user.password')
					.getOne();

				if (admin) {
					const isPasswordValid = await compare('admin', admin.password);
					if (!isPasswordValid) {
						this.logger.log('Restableciendo contraseña para administrador ADM001...');
						const fixedHash = await hash('admin', 10);
						await this.userRepository.update(admin.id, { password: fixedHash });
					}
				} else {
					// En caso de usar la base de datos de PC donde el admin original tiene otra clave personal,
					// asegurar que ADM001 / admin siempre esté disponible como usuario de acceso rápido:
					const institute = await this.instituteRepository.findOne({ where: {} });
					const newAdmin = this.userRepository.create({
						name: 'Administrador',
						lastName: 'Pandora',
						email: 'admin@pandora.local',
						code: 'ADM001',
						password: 'admin',
						rol: Role.Admin,
						exist: true,
						institute: institute || undefined,
					});
					await this.userRepository.save(newAdmin);
					this.logger.log('Usuario ADM001 asegurado en la base de datos.');
				}
			}
		} catch (error) {
			this.logger.error(
				'Error al verificar inicialización de la base de datos:',
				error,
			);
		}

		try {
			await this.ensureQuizScansTable();
		} catch (error) {
			this.logger.warn('No se pudo verificar la tabla quiz_scans:', error);
		}

		try {
			await this.ensureSurveyTables();
		} catch (error) {
			this.logger.warn('No se pudieron verificar las tablas de encuestas:', error);
		}

		try {
			await this.ensureGradeColumns();
		} catch (error) {
			this.logger.warn('No se pudieron verificar las columnas de grade:', error);
		}

		try {
			await this.ensureAttendanceTables();
		} catch (error) {
			this.logger.warn('No se pudieron verificar las tablas de asistencia:', error);
		}
	}

	private async ensureGradeColumns() {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		try {
			const table = await queryRunner.getTable('grade');
			if (!table) return;

			const driver = this.dataSource.options.type;
			if (!table.findColumnByName('submissionStatus')) {
				await queryRunner.query(
					driver === 'postgres'
						? `ALTER TABLE "grade" ADD COLUMN IF NOT EXISTS "submissionStatus" character varying`
						: `ALTER TABLE "grade" ADD COLUMN "submissionStatus" varchar`,
				);
				this.logger.log('Columna grade.submissionStatus agregada.');
			}

			if (!table.findColumnByName('evaluationStatus')) {
				await queryRunner.query(
					driver === 'postgres'
						? `ALTER TABLE "grade" ADD COLUMN IF NOT EXISTS "evaluationStatus" character varying`
						: `ALTER TABLE "grade" ADD COLUMN "evaluationStatus" varchar`,
				);
				this.logger.log('Columna grade.evaluationStatus agregada.');
			}

			if (driver === 'postgres') {
				const gradeCol = table.findColumnByName('grade');
				if (gradeCol && !gradeCol.isNullable) {
					await queryRunner.query(
						`ALTER TABLE "grade" ALTER COLUMN "grade" DROP NOT NULL`,
					);
					await queryRunner.query(
						`ALTER TABLE "grade" ALTER COLUMN "grade" SET DEFAULT NULL`,
					);
				}
			}
		} finally {
			await queryRunner.release();
		}
	}

	private async ensureSurveyTables() {
		const isPostgres = this.dataSource.options.type === 'postgres';
		if (isPostgres) {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_templates" (
					"id" SERIAL PRIMARY KEY,
					"name" varchar(255) NOT NULL,
					"slug" varchar(255) NOT NULL UNIQUE,
					"version" integer NOT NULL DEFAULT 1,
					"questionsConfig" jsonb NOT NULL,
					"active" boolean NOT NULL DEFAULT true,
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					"updatedAt" TIMESTAMP NOT NULL DEFAULT now()
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_sessions" (
					"id" SERIAL PRIMARY KEY,
					"templateId" integer NOT NULL,
					"year" integer NOT NULL,
					"label" varchar(255) NOT NULL,
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					CONSTRAINT "FK_survey_sessions_template" FOREIGN KEY ("templateId") REFERENCES "survey_templates" ("id") ON DELETE CASCADE
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_responses" (
					"id" SERIAL PRIMARY KEY,
					"templateId" integer NOT NULL,
					"sessionId" integer,
					"code" varchar(10) NOT NULL,
					"answers" jsonb NOT NULL,
					"imageUrl" varchar(255),
					"respondent" varchar(100),
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					CONSTRAINT "FK_survey_responses_template" FOREIGN KEY ("templateId") REFERENCES "survey_templates" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_survey_responses_session" FOREIGN KEY ("sessionId") REFERENCES "survey_sessions" ("id") ON DELETE SET NULL
				);
			`);
		} else {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_templates" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"name" varchar NOT NULL,
					"slug" varchar NOT NULL,
					"version" integer NOT NULL DEFAULT (1),
					"questionsConfig" text NOT NULL,
					"active" boolean NOT NULL DEFAULT (1),
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					"updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "UQ_survey_templates_slug" UNIQUE ("slug")
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_sessions" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"templateId" integer NOT NULL,
					"year" integer NOT NULL,
					"label" varchar NOT NULL,
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "FK_survey_sessions_template" FOREIGN KEY ("templateId") REFERENCES "survey_templates" ("id") ON DELETE CASCADE
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "survey_responses" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"templateId" integer NOT NULL,
					"sessionId" integer,
					"code" varchar(10) NOT NULL,
					"answers" text NOT NULL,
					"imageUrl" varchar,
					"respondent" varchar,
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "FK_survey_responses_template" FOREIGN KEY ("templateId") REFERENCES "survey_templates" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_survey_responses_session" FOREIGN KEY ("sessionId") REFERENCES "survey_sessions" ("id") ON DELETE SET NULL
				);
			`);
		}

		try {
			await this.ensureDefaultSurveyTemplates();
		} catch (e) {
			this.logger.warn('Error al verificar plantillas por defecto:', e);
		}
	}

	private async ensureDefaultSurveyTemplates() {
		const parentTemplate = await this.templateRepository.findOne({
			where: { slug: 'parent-survey' },
		});
		if (!parentTemplate) {
			await this.templateRepository.save({
				name: 'Encuesta a Padres',
				slug: 'parent-survey',
				questionsConfig: {
					sections: [
						{
							id: 'seccion1',
							title: 'Preguntas 1 a 14',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 14,
						},
						{
							id: 'seccion2',
							title: 'Preguntas 15 a 18',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 4,
						},
					],
				},
			});
			this.logger.log('Plantilla parent-survey creada automáticamente.');
		}

		const studentTemplate = await this.templateRepository.findOne({
			where: { slug: 'student-survey' },
		});
		if (!studentTemplate) {
			await this.templateRepository.save({
				name: 'Encuesta a Estudiantes',
				slug: 'student-survey',
				questionsConfig: {
					sections: [
						{
							id: 'seccion1',
							title: 'Pregunta 1',
							type: 'yesno',
							options: ['Sí', 'No'],
							count: 1,
						},
						{
							id: 'seccion2',
							title: 'Preguntas 2 a 15',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 14,
						},
						{
							id: 'seccion3',
							title: 'Preguntas 16 a 19',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 4,
						},
						{
							id: 'seccion4',
							title: 'Pregunta 20 - Multiselect',
							type: 'multiselect',
							options: [
								'Tablero',
								'Películas y videos',
								'Láminas y otros materiales gráficos',
								'Computadores',
								'Diapositivas o acetatos',
								'Música',
								'Libros de texto',
								'Laboratorios',
								'Otros',
								'Programas educativos computarizados',
								'Mapas',
							],
						},
					],
				},
			});
			this.logger.log('Plantilla student-survey creada automáticamente.');
		}
	}

	private async ensureQuizScansTable() {
		const isPostgres = this.dataSource.options.type === 'postgres';
		if (isPostgres) {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "quiz_scans" (
					"id" SERIAL PRIMARY KEY,
					"quizId" integer NOT NULL,
					"userId" integer NOT NULL,
					"section" integer NOT NULL DEFAULT 1,
					"imageUrl" varchar(255) NOT NULL,
					"filename" varchar(255) NOT NULL,
					"instituteId" integer,
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					CONSTRAINT "FK_quiz_scans_quiz" FOREIGN KEY ("quizId") REFERENCES "quizzes" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_quiz_scans_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_quiz_scans_institute" FOREIGN KEY ("instituteId") REFERENCES "institute" ("id") ON DELETE CASCADE
				);
			`);
		} else {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "quiz_scans" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"quizId" integer NOT NULL,
					"userId" integer NOT NULL,
					"section" integer NOT NULL DEFAULT 1,
					"imageUrl" varchar(255) NOT NULL,
					"filename" varchar(255) NOT NULL,
					"instituteId" integer,
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "FK_quiz_scans_quiz" FOREIGN KEY ("quizId") REFERENCES "quizzes" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_quiz_scans_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_quiz_scans_institute" FOREIGN KEY ("instituteId") REFERENCES "institute" ("id") ON DELETE CASCADE
				);
			`);
		}
	}

	private async ensureAttendanceTables() {
		const isPostgres = this.dataSource.options.type === 'postgres';
		if (isPostgres) {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "attendance_sessions" (
					"id" SERIAL PRIMARY KEY,
					"scope" varchar(20) NOT NULL DEFAULT 'general',
					"date" varchar(10) NOT NULL,
					"closingTime" varchar(10),
					"year" integer NOT NULL,
					"courseId" integer,
					"lessonId" integer,
					"instituteId" integer,
					"authorId" integer,
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					"updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
					CONSTRAINT "FK_att_session_course" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_lesson" FOREIGN KEY ("lessonId") REFERENCES "lesson" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_institute" FOREIGN KEY ("instituteId") REFERENCES "institute" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_author" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE SET NULL
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "attendance_records" (
					"id" SERIAL PRIMARY KEY,
					"sessionId" integer,
					"studentId" integer,
					"status" varchar(20) NOT NULL DEFAULT 'absent',
					"eventTime" varchar(10),
					"scannedByMarker" boolean NOT NULL DEFAULT false,
					"note" text,
					"createdAt" TIMESTAMP NOT NULL DEFAULT now(),
					"updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
					CONSTRAINT "FK_att_record_session" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_record_student" FOREIGN KEY ("studentId") REFERENCES "user" ("id") ON DELETE CASCADE
				);
			`);
		} else {
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "attendance_sessions" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"scope" varchar(20) NOT NULL DEFAULT 'general',
					"date" varchar(10) NOT NULL,
					"closingTime" varchar(10),
					"year" integer NOT NULL,
					"courseId" integer,
					"lessonId" integer,
					"instituteId" integer,
					"authorId" integer,
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					"updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "FK_att_session_course" FOREIGN KEY ("courseId") REFERENCES "course" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_lesson" FOREIGN KEY ("lessonId") REFERENCES "lesson" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_institute" FOREIGN KEY ("instituteId") REFERENCES "institute" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_session_author" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE SET NULL
				);
			`);
			await this.dataSource.query(`
				CREATE TABLE IF NOT EXISTS "attendance_records" (
					"id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
					"sessionId" integer,
					"studentId" integer,
					"status" varchar(20) NOT NULL DEFAULT 'absent',
					"eventTime" varchar(10),
					"scannedByMarker" boolean NOT NULL DEFAULT (0),
					"note" text,
					"createdAt" datetime NOT NULL DEFAULT (datetime('now')),
					"updatedAt" datetime NOT NULL DEFAULT (datetime('now')),
					CONSTRAINT "FK_att_record_session" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions" ("id") ON DELETE CASCADE,
					CONSTRAINT "FK_att_record_student" FOREIGN KEY ("studentId") REFERENCES "user" ("id") ON DELETE CASCADE
				);
			`);
		}
	}

	private async seedInitialData() {
		const adminUser = this.userRepository.create({
			name: 'Administrador',
			lastName: 'Pandora',
			email: 'admin@pandora.local',
			code: 'ADM001',
			password: 'admin',
			rol: Role.Admin,
			exist: true,
		});
		await this.userRepository.save(adminUser);

		const institute = this.instituteRepository.create({
			name: 'Institución Educativa Pandora',
			owner: adminUser,
			exist: true,
		});
		await this.instituteRepository.save(institute);

		adminUser.institute = institute;
		await this.userRepository.save(adminUser);

		const parentTemplate = await this.templateRepository.findOne({
			where: { slug: 'parent-survey' },
		});
		if (!parentTemplate) {
			await this.templateRepository.save({
				name: 'Encuesta a Padres',
				slug: 'parent-survey',
				questionsConfig: {
					sections: [
						{
							id: 'seccion1',
							title: 'Preguntas 1 a 14',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 14,
						},
						{
							id: 'seccion2',
							title: 'Preguntas 15 a 18',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 4,
						},
					],
				},
			});
		}

		const studentTemplate = await this.templateRepository.findOne({
			where: { slug: 'student-survey' },
		});
		if (!studentTemplate) {
			await this.templateRepository.save({
				name: 'Encuesta a Estudiantes',
				slug: 'student-survey',
				questionsConfig: {
					sections: [
						{
							id: 'seccion1',
							title: 'Pregunta 1',
							type: 'yesno',
							options: ['Sí', 'No'],
							count: 1,
						},
						{
							id: 'seccion2',
							title: 'Preguntas 2 a 15',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 14,
						},
						{
							id: 'seccion3',
							title: 'Preguntas 16 a 19',
							type: 'likert',
							options: ['Nunca', 'Algunas veces', 'Casi siempre', 'Siempre'],
							count: 4,
						},
						{
							id: 'seccion4',
							title: 'Pregunta 20 - Multiselect',
							type: 'multiselect',
							options: [
								'Tablero',
								'Películas y videos',
								'Láminas y otros materiales gráficos',
								'Computadores',
								'Diapositivas o acetatos',
								'Música',
								'Libros de texto',
								'Laboratorios',
								'Otros',
								'Programas educativos computarizados',
								'Mapas',
							],
						},
					],
				},
			});
		}

		this.logger.log(
			'Inicialización completada exitosamente. Usuario administrador inicial: admin@pandora.local',
		);
	}
}

