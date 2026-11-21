import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEvidence } from './activity-evidence.entity';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { getUploadsDir } from '../../common/utils/paths.util';

@Injectable()
export class ActivityEvidencesService {
	private readonly uploadDir = getUploadsDir();

	constructor(
		@InjectRepository(ActivityEvidence)
		private readonly evidenceRepository: Repository<ActivityEvidence>,
	) {
		if (!fs.existsSync(this.uploadDir)) {
			fs.mkdirSync(this.uploadDir, { recursive: true });
		}
	}

	async processAndSaveEvidence(
		files: Express.Multer.File[],
		studentId: number,
		activityId: number,
		instituteId: number,
	): Promise<ActivityEvidence> {
		const results = await this.processAndSaveEvidenceForStudents(
			files,
			[studentId],
			activityId,
			instituteId,
		);
		return results[0];
	}

	async processAndSaveEvidenceForStudents(
		files: Express.Multer.File[],
		studentIds: number[],
		activityId: number,
		instituteId: number,
	): Promise<ActivityEvidence[]> {
		if (!files || files.length === 0) {
			throw new InternalServerErrorException('No se han proporcionado archivos para la evidencia.');
		}

		if (!studentIds || studentIds.length === 0) {
			throw new BadRequestException('Se debe especificar al menos un estudiante.');
		}

		try {
			// Si es un anexo único y NO es una imagen (ej. Word, Excel, PowerPoint, ZIP, o PDF individual)
			// se preserva en su formato nativo original sin convertir ni forzar a PDF
			const firstFile = files[0];
			const firstExt = path.extname(firstFile.originalname).toLowerCase();
			const isImage = ['.jpg', '.jpeg', '.png'].includes(firstExt);

			if (files.length === 1 && !isImage) {
				let fileBuffer: Buffer;
				if (firstFile.buffer) {
					fileBuffer = firstFile.buffer;
				} else if (firstFile.path && fs.existsSync(firstFile.path)) {
					fileBuffer = fs.readFileSync(firstFile.path);
				} else {
					throw new InternalServerErrorException('No se pudo leer el archivo adjunto.');
				}

				if (firstFile.path && fs.existsSync(firstFile.path)) {
					try {
						fs.unlinkSync(firstFile.path);
					} catch (e) {
						console.error(`Could not delete temp file ${firstFile.path}:`, e);
					}
				}

				const finalFilename = studentIds.length > 1
					? `evidencia_${activityId}_shared_${Date.now()}${firstExt}`
					: `evidencia_${activityId}_${studentIds[0]}_${Date.now()}${firstExt}`;
				const finalFilePath = path.join(this.uploadDir, finalFilename);
				fs.writeFileSync(finalFilePath, fileBuffer);

				const relativeUrl = `files/uploads/${finalFilename}`;
				const savedEvidences: ActivityEvidence[] = [];

				for (const sId of studentIds) {
					let evidence = await this.evidenceRepository.findOne({
						where: { studentId: sId, activityId },
					});

					if (evidence) {
						if (evidence.pdfUrl && evidence.pdfUrl !== 'PHYSICAL' && evidence.pdfUrl !== relativeUrl) {
							const countUsingOld = await this.evidenceRepository.count({
								where: { pdfUrl: evidence.pdfUrl },
							});
							if (countUsingOld <= 1) {
								const oldFileName = path.basename(evidence.pdfUrl);
								const oldFilePath = path.join(this.uploadDir, oldFileName);
								if (fs.existsSync(oldFilePath)) {
									try {
										fs.unlinkSync(oldFilePath);
									} catch (e) {
										console.error(`Error deleting old evidence file:`, e);
									}
								}
							}
						}

						evidence.pdfUrl = relativeUrl;
						evidence.filename = firstFile.originalname;
						evidence.createdAt = new Date();
					} else {
						evidence = this.evidenceRepository.create({
							studentId: sId,
							activityId,
							instituteId,
							pdfUrl: relativeUrl,
							filename: firstFile.originalname,
						});
					}

					const saved = await this.evidenceRepository.save(evidence);
					savedEvidences.push(saved);
				}

				return savedEvidences;
			}

			// Para múltiples fotos / imágenes: se compilan en un documento PDF unificado
			const mergedPdf = await PDFDocument.create();

			for (const file of files) {
				const ext = path.extname(file.originalname).toLowerCase();
				let fileBuffer: Buffer;

				if (file.buffer) {
					fileBuffer = file.buffer;
				} else if (file.path && fs.existsSync(file.path)) {
					fileBuffer = fs.readFileSync(file.path);
				} else {
					continue;
				}

				try {
					if (ext === '.pdf') {
						const srcPdf = await PDFDocument.load(fileBuffer);
						const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
						copiedPages.forEach((page) => mergedPdf.addPage(page));
					} else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
						let embeddedImage;
						if (ext === '.png') {
							embeddedImage = await mergedPdf.embedPng(fileBuffer);
						} else {
							embeddedImage = await mergedPdf.embedJpg(fileBuffer);
						}

						const page = mergedPdf.addPage([embeddedImage.width, embeddedImage.height]);
						page.drawImage(embeddedImage, {
							x: 0,
							y: 0,
							width: embeddedImage.width,
							height: embeddedImage.height,
						});
					} else {
						const page = mergedPdf.addPage([595.28, 841.89]);
						page.drawText(`Archivo adjunto: ${file.originalname}`, { x: 50, y: 750, size: 16 });
					}
				} catch (fileErr) {
					console.error(`Error processing file ${file.originalname}:`, fileErr);
				} finally {
					// Clean up original temporary file on disk if it was stored by multer diskStorage
					if (file.path && fs.existsSync(file.path)) {
						try {
							fs.unlinkSync(file.path);
						} catch (e) {
							console.error(`Could not delete temp file ${file.path}:`, e);
						}
					}
				}
			}

			const pdfBytes = await mergedPdf.save();
			const finalFilename = studentIds.length > 1
				? `evidencia_${activityId}_shared_${Date.now()}.pdf`
				: `evidencia_${activityId}_${studentIds[0]}_${Date.now()}.pdf`;
			const finalFilePath = path.join(this.uploadDir, finalFilename);
			fs.writeFileSync(finalFilePath, Buffer.from(pdfBytes));

			const relativeUrl = `files/uploads/${finalFilename}`;
			const savedEvidences: ActivityEvidence[] = [];

			for (const sId of studentIds) {
				let evidence = await this.evidenceRepository.findOne({
					where: { studentId: sId, activityId },
				});

				if (evidence) {
					// If the student previously had an individual or old file, check if others still use it
					if (evidence.pdfUrl && evidence.pdfUrl !== 'PHYSICAL' && evidence.pdfUrl !== relativeUrl) {
						const countUsingOld = await this.evidenceRepository.count({
							where: { pdfUrl: evidence.pdfUrl },
						});
						if (countUsingOld <= 1) {
							const oldFileName = path.basename(evidence.pdfUrl);
							const oldFilePath = path.join(this.uploadDir, oldFileName);
							if (fs.existsSync(oldFilePath)) {
								try {
									fs.unlinkSync(oldFilePath);
								} catch (e) {
									console.error(`Error deleting old evidence PDF:`, e);
								}
							}
						}
					}

					evidence.pdfUrl = relativeUrl;
					evidence.filename = files.length === 1 ? files[0].originalname : finalFilename;
					evidence.createdAt = new Date();
				} else {
					evidence = this.evidenceRepository.create({
						studentId: sId,
						activityId,
						instituteId,
						pdfUrl: relativeUrl,
						filename: files.length === 1 ? files[0].originalname : finalFilename,
					});
				}

				const saved = await this.evidenceRepository.save(evidence);
				savedEvidences.push(saved);
			}

			return savedEvidences;
		} catch (error) {
			console.error('Error in processAndSaveEvidenceForStudents:', error);
			throw new InternalServerErrorException('Error procesando y guardando la evidencia en PDF.');
		}
	}

	async findByActivity(activityId: number): Promise<ActivityEvidence[]> {
		return await this.evidenceRepository.find({
			where: { activityId },
			relations: ['student'],
		});
	}

	async markPhysicalDelivery(
		studentId: number,
		activityId: number,
		instituteId: number,
		delivered: boolean,
		sharedToken?: string,
	): Promise<{ delivered: boolean; evidence?: ActivityEvidence }> {
		const existing = await this.evidenceRepository.findOne({
			where: { studentId, activityId },
		});

		const pdfUrlValue = sharedToken ? `PHYSICAL_GROUP_${sharedToken}` : 'PHYSICAL';
		const filenameValue = sharedToken ? 'Entrega física en equipo' : 'Entrega en físico';

		if (delivered) {
			if (existing) {
				if (existing.pdfUrl.startsWith('PHYSICAL')) {
					existing.pdfUrl = pdfUrlValue;
					existing.filename = filenameValue;
					const updated = await this.evidenceRepository.save(existing);
					return { delivered: true, evidence: updated };
				}
				return { delivered: true, evidence: existing };
			}
			const newEvidence = this.evidenceRepository.create({
				studentId,
				activityId,
				instituteId,
				pdfUrl: pdfUrlValue,
				filename: filenameValue,
			});
			const saved = await this.evidenceRepository.save(newEvidence);
			return { delivered: true, evidence: saved };
		} else {
			if (existing && existing.pdfUrl.startsWith('PHYSICAL')) {
				await this.evidenceRepository.remove(existing);
			}
			return { delivered: false };
		}
	}

	async markBulkPhysicalDelivery(
		studentIds: number[],
		activityId: number,
		instituteId: number,
		delivered: boolean,
		isGroup: boolean = false,
		customSharedToken?: string,
	): Promise<{ success: boolean; count: number; evidences: ActivityEvidence[] }> {
		let count = 0;
		const sharedToken =
			customSharedToken ||
			(isGroup && studentIds.length > 0
				? `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
				: undefined);
		const evidences: ActivityEvidence[] = [];

		for (const studentId of studentIds) {
			const res = await this.markPhysicalDelivery(
				studentId,
				activityId,
				instituteId,
				delivered,
				sharedToken,
			);
			if (res.evidence) {
				evidences.push(res.evidence);
			}
			count++;
		}
		return { success: true, count, evidences };
	}

	async findByStudentAndActivity(studentId: number, activityId: number): Promise<ActivityEvidence> {
		return await this.evidenceRepository.findOne({
			where: { studentId, activityId },
		});
	}

	async deleteEvidence(
		id: number,
		deleteShared: boolean = false,
	): Promise<{ success: boolean; deletedCount: number }> {
		const evidence = await this.evidenceRepository.findOne({ where: { id } });
		if (!evidence) {
			throw new NotFoundException(`Evidencia con ID ${id} no encontrada.`);
		}

		const isPhysical = evidence.pdfUrl.startsWith('PHYSICAL');
		const pdfUrl = evidence.pdfUrl;
		const activityId = evidence.activityId;

		if (deleteShared && pdfUrl) {
			// Find all evidences in this activity that share the same pdfUrl
			const sharedEvidences = await this.evidenceRepository.find({
				where: { pdfUrl, activityId },
			});

			if (!isPhysical) {
				const filename = path.basename(pdfUrl);
				const filePath = path.join(this.uploadDir, filename);
				if (fs.existsSync(filePath)) {
					try {
						fs.unlinkSync(filePath);
					} catch (e) {
						console.error(`Error deleting shared evidence file: ${filePath}`, e);
					}
				}
			}

			await this.evidenceRepository.remove(sharedEvidences);
			return { success: true, deletedCount: sharedEvidences.length };
		} else {
			// Delete only this single evidence record
			if (!isPhysical && pdfUrl) {
				const countUsingFile = await this.evidenceRepository.count({
					where: { pdfUrl },
				});

				// Only remove from disk if this was the only record referencing it
				if (countUsingFile <= 1) {
					const filename = path.basename(pdfUrl);
					const filePath = path.join(this.uploadDir, filename);
					if (fs.existsSync(filePath)) {
						try {
							fs.unlinkSync(filePath);
						} catch (e) {
							console.error(`Error deleting evidence file: ${filePath}`, e);
						}
					}
				}
			}

			await this.evidenceRepository.remove(evidence);
			return { success: true, deletedCount: 1 };
		}
	}
}
