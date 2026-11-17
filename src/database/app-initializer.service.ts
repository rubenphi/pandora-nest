import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../modules/users/user.entity';
import { Institute } from '../modules/institutes/institute.entity';
import { Role } from '../modules/auth/roles.decorator';
import { SurveyTemplate } from '../modules/surveys/survey-template.entity';

@Injectable()
export class AppInitializerService implements OnApplicationBootstrap {
	private readonly logger = new Logger(AppInitializerService.name);

	constructor(
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
			if (count === 0) {
				this.logger.log(
					'Base de datos vacía detectada. Inicializando datos por defecto para primer uso...',
				);
				await this.seedInitialData();
			}
		} catch (error) {
			this.logger.error(
				'Error al verificar inicialización de la base de datos:',
				error,
			);
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
