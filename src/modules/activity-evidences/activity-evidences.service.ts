import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityEvidence } from './activity-evidence.entity';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as libre from 'libreoffice-convert';

const libreConvert = promisify(libre.convert);

@Injectable()
export class ActivityEvidencesService {
	private readonly uploadDir = path.join(process.cwd(), 'uploads');

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
		if (!files || files.length === 0) {
			throw new InternalServerErrorException('No se han proporcionado archivos para la evidencia.');
		}

		try {
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
					} else if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(ext)) {
						try {
							const pdfBuffer = await libreConvert(fileBuffer, '.pdf', undefined);
							const srcPdf = await PDFDocument.load(pdfBuffer);
							const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
							copiedPages.forEach((page) => mergedPdf.addPage(page));
						} catch (convErr) {
							console.warn(`Could not convert office file ${file.originalname} via LibreOffice:`, convErr.message);
							const page = mergedPdf.addPage([595.28, 841.89]);
							page.drawText(`Archivo adjunto: ${file.originalname}`, { x: 50, y: 750, size: 16 });
							page.drawText(`Nota: No se pudo convertir automáticamente la vista previa de este documento.`, { x: 50, y: 720, size: 12 });
						}
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
			const finalFilename = `evidencia_${activityId}_${studentId}_${Date.now()}.pdf`;
			const finalFilePath = path.join(this.uploadDir, finalFilename);
			fs.writeFileSync(finalFilePath, Buffer.from(pdfBytes));

			const relativeUrl = `files/uploads/${finalFilename}`;

			// Check if evidence record already exists for student and activity
			let evidence = await this.evidenceRepository.findOne({
				where: { studentId, activityId },
			});

			if (evidence) {
				// Optionally delete old PDF file
				const oldFileName = path.basename(evidence.pdfUrl);
				const oldFilePath = path.join(this.uploadDir, oldFileName);
				if (fs.existsSync(oldFilePath)) {
					try {
						fs.unlinkSync(oldFilePath);
					} catch (e) {
						console.error(`Error deleting old evidence PDF:`, e);
					}
				}

				evidence.pdfUrl = relativeUrl;
				evidence.filename = finalFilename;
				evidence.createdAt = new Date();
			} else {
				evidence = this.evidenceRepository.create({
					studentId,
					activityId,
					instituteId,
					pdfUrl: relativeUrl,
					filename: finalFilename,
				});
			}

			return await this.evidenceRepository.save(evidence);
		} catch (error) {
			console.error('Error in processAndSaveEvidence:', error);
			throw new InternalServerErrorException('Error procesando y guardando la evidencia en PDF.');
		}
	}

	async findByActivity(activityId: number): Promise<ActivityEvidence[]> {
		return await this.evidenceRepository.find({
			where: { activityId },
			relations: ['student'],
		});
	}

	async findByStudentAndActivity(studentId: number, activityId: number): Promise<ActivityEvidence> {
		return await this.evidenceRepository.findOne({
			where: { studentId, activityId },
		});
	}

	async deleteEvidence(id: number): Promise<void> {
		const evidence = await this.evidenceRepository.findOne({ where: { id } });
		if (!evidence) {
			throw new NotFoundException(`Evidencia con ID ${id} no encontrada.`);
		}

		const filename = path.basename(evidence.pdfUrl);
		const filePath = path.join(this.uploadDir, filename);
		if (fs.existsSync(filePath)) {
			try {
				fs.unlinkSync(filePath);
			} catch (e) {
				console.error(`Error deleting evidence file: ${filePath}`, e);
			}
		}

		await this.evidenceRepository.remove(evidence);
	}
}
