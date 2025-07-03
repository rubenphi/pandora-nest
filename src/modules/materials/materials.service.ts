import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { CreateMaterialDto, QueryMaterialDto, UpdateMaterialDto } from './dto';
import { Institute } from '../institutes/institute.entity';
import { Lesson } from '../lessons/lesson.entity';

@Injectable()
export class MaterialsService {
	constructor(
		@InjectRepository(Material)
		private readonly materialRepository: Repository<Material>,
		@InjectRepository(Institute)
		private readonly InstuteRepository: Repository<Institute>,
		@InjectRepository(Lesson)
		private readonly lessonRepository: Repository<Lesson>,
	) {}

	async create(createMaterialDto: CreateMaterialDto): Promise<Material> {
		const institute: Institute = await this.InstuteRepository.findOne({
			where: { id: createMaterialDto.instituteId },
		});
		if (!institute) {
			throw new NotFoundException(
				`Institute with ID ${createMaterialDto.instituteId} not found`,
			);
		}

		const lesson: Lesson = await this.lessonRepository.findOne({
			where: { id: createMaterialDto.lessonId },
		});
		if (!lesson) {
			throw new NotFoundException(
				`Lesson with ID ${createMaterialDto.lessonId} not found`,
			);
		}
		const material: Material = this.materialRepository.create({
			content: createMaterialDto.content,
			title: createMaterialDto.title,
			lesson: lesson,
			institute: institute,

			exist: createMaterialDto.exist,
			type: createMaterialDto.type,
			url: createMaterialDto.url,
		});
		return this.materialRepository.save(material);
	}

	async findAll(query: QueryMaterialDto): Promise<Material[]> {
		const where: any = {};

		if (query.lessonId) {
			where.lesson = { id: query.lessonId };
		}

		if (query.courseId) {
			where.lesson = { ...where.lesson, course: { id: query.courseId } };
		}

		if (query.areaId) {
			where.lesson = { ...where.lesson, area: { id: query.areaId } };
		}

		if (query.instituteId) {
			where.institute = { id: query.instituteId };
		}

		return this.materialRepository.find({
			where,
			relations: ['lesson', 'lesson.course', 'lesson.area', 'institute'],
		});
	}

	async findOne(id: number): Promise<Material> {
		const material = await this.materialRepository.findOne({ where: { id } });
		if (!material) {
			throw new NotFoundException(`Material with ID ${id} not found`);
		}
		return material;
	}

	async update(
		id: number,
		updateMaterialDto: UpdateMaterialDto,
	): Promise<Material> {
		const institute: Institute = await this.InstuteRepository.findOne({
			where: { id: updateMaterialDto.instituteId },
		});
		if (!institute) {
			throw new NotFoundException(
				`Institute with ID ${updateMaterialDto.instituteId} not found`,
			);
		}

		const lesson: Lesson = await this.lessonRepository.findOne({
			where: { id: updateMaterialDto.lessonId },
		});
		const material: Material = await this.materialRepository.preload({
			id,
			content: updateMaterialDto.content,
			title: updateMaterialDto.title,
			lesson: lesson,
			institute: institute,

			exist: updateMaterialDto.exist,
			type: updateMaterialDto.type,
			url: updateMaterialDto.url,
		});
		return this.materialRepository.save(material);
	}

	async remove(id: number): Promise<void> {
		const result = await this.materialRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Material with ID ${id} not found`);
		}
	}
}
