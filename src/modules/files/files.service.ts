import {
	Injectable,
	BadRequestException,
	NotFoundException,
	StreamableFile,
} from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join, basename } from 'path';
import { unlink } from 'fs/promises';
import {
	existsSync,
	mkdirSync,
	writeFileSync,
	readFileSync,
	unlinkSync,
	createReadStream,
	readdirSync,
} from 'fs';
import { Response } from 'express';
import { getUploadsDir } from '../../common/utils/paths.util';

@Injectable()
export class FilesService {
	getUploadDir(): string {
		return getUploadsDir();
	}

	createMulterOptions(): MulterModuleOptions {
		return {
			storage: diskStorage({
				destination: (req, file, cb) => {
					cb(null, this.getUploadDir());
				},
				filename: (req, file, cb) => {
					const randomName = Array(32)
						.fill(null)
						.map(() => Math.round(Math.random() * 16).toString(16))
						.join('');
					cb(null, `${randomName}${extname(file.originalname)}`);
				},
			}),
		};
	}

	getUploadedFileUrl(filename: string): string {
		return `files/uploads/${filename}`;
	}

	async deleteFile(filename: string): Promise<void> {
		const filePath = join(this.getUploadDir(), filename);
		try {
			await unlink(filePath);
		} catch (error) {
			console.error(`Error deleting file ${filename}:`, error);
		}
	}

	deleteTestScan(quizId: string, filename: string): void {
		if (!quizId || !filename) return;
		const safeFilename = basename(filename);
		const dirs = [
			join(this.getUploadDir(), 'test', quizId),
			join(process.cwd(), 'uploads', 'test', quizId),
		];
		for (const dir of dirs) {
			const p = join(dir, safeFilename);
			if (existsSync(p)) {
				try {
					unlinkSync(p);
				} catch (_) {}
			}
		}
	}

	deleteStudentScans(
		quizId: string,
		studentIdentifier: string,
		section?: number | string,
	): void {
		if (!quizId || !studentIdentifier) return;
		const secNum =
			section !== undefined && section !== null && section !== ''
				? String(section)
				: null;
		const exactSecPrefix =
			secNum !== null ? `${studentIdentifier}_sec${secNum}_` : null;
		const anySecPrefix = `${studentIdentifier}_`;

		const dirs = [
			join(this.getUploadDir(), 'test', quizId),
			join(process.cwd(), 'uploads', 'test', quizId),
		];
		for (const dir of dirs) {
			if (existsSync(dir)) {
				try {
					const files = readdirSync(dir);
					for (const file of files) {
						if (!file.startsWith(anySecPrefix)) continue;

						let matches = false;
						if (exactSecPrefix) {
							// Coincide exactamente con la sección actual (e.g. "EST123_sec1_...")
							if (file.startsWith(exactSecPrefix)) {
								matches = true;
							} else if (secNum === '1') {
								// Compatibilidad con archivos antiguos de sección 1 que no incluían el tag _sec (e.g. "EST123_1732190000.png")
								const legacySec1Pattern = new RegExp(
									`^${studentIdentifier}_\\d+\\.png$`,
								);
								if (legacySec1Pattern.test(file)) {
									matches = true;
								}
							}
						} else {
							// Si no se especificó sección, borrar todos los escaneos de este estudiante en este quiz
							matches = true;
						}

						if (matches) {
							try {
								unlinkSync(join(dir, file));
							} catch (_) {}
						}
					}
				} catch (_) {}
			}
		}
	}

	async saveTestScan(
		quizId: string,
		file?: Express.Multer.File,
		body?: any,
	): Promise<{ filename: string; url: string; path: string }> {
		const baseUploadDir = this.getUploadDir();
		const testDir = join(baseUploadDir, 'test', quizId);
		if (!existsSync(testDir)) {
			mkdirSync(testDir, { recursive: true });
		}

		// También asegurar reflejo en ./uploads/test/:quizId relativo a cwd
		const devTestDir = join(process.cwd(), 'uploads', 'test', quizId);
		if (devTestDir !== testDir && !existsSync(devTestDir)) {
			try {
				mkdirSync(devTestDir, { recursive: true });
			} catch (_) {}
		}

		const studentCode = body?.studentCode || body?.studentId || 'scan';
		const section = body?.section ? `_sec${body.section}` : '';

		// Si es un escaneo de un estudiante específico, borrar cualquier escaneo previo de ese estudiante y sección
		if (studentCode !== 'scan') {
			this.deleteStudentScans(quizId, String(studentCode), body?.section);
		}
		if (body?.studentId && String(body?.studentId) !== String(studentCode)) {
			this.deleteStudentScans(quizId, String(body.studentId), body?.section);
		}

		const timestamp = Date.now();
		const filename = `${studentCode}${section}_${timestamp}.png`;
		const filePath = join(testDir, filename);

		let buffer: Buffer | null = null;

		if (file && file.buffer) {
			buffer = file.buffer;
		} else if (file && file.path && existsSync(file.path)) {
			buffer = readFileSync(file.path);
			try {
				unlinkSync(file.path);
			} catch (_) {}
		} else if (body?.image && typeof body.image === 'string') {
			const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
			buffer = Buffer.from(base64Data, 'base64');
		}

		if (!buffer) {
			throw new BadRequestException(
				'No se proporcionó ninguna imagen válida (file o base64).',
			);
		}

		writeFileSync(filePath, buffer);

		if (devTestDir !== testDir && existsSync(devTestDir)) {
			try {
				writeFileSync(join(devTestDir, filename), buffer);
			} catch (_) {}
		}

		const relativeUrl = `files/uploads/test/${quizId}/${filename}`;
		return {
			filename,
			url: relativeUrl,
			path: `uploads/test/${quizId}/${filename}`,
		};
	}

	saveSurveyScan(
		scopeId: string | number,
		base64Image: string,
		code?: string,
	): { filename: string; url: string; path: string } {
		const baseUploadDir = this.getUploadDir();
		const surveyDir = join(baseUploadDir, 'surveys', String(scopeId));
		if (!existsSync(surveyDir)) {
			mkdirSync(surveyDir, { recursive: true });
		}

		const devSurveyDir = join(
			process.cwd(),
			'uploads',
			'surveys',
			String(scopeId),
		);
		if (devSurveyDir !== surveyDir && !existsSync(devSurveyDir)) {
			try {
				mkdirSync(devSurveyDir, { recursive: true });
			} catch (_) {}
		}

		const safeCode = code
			? String(code).replace(/[^a-zA-Z0-9_-]/g, '')
			: 'scan';
		const filename = `${safeCode}_${Date.now()}.png`;
		const filePath = join(surveyDir, filename);

		const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
		const buffer = Buffer.from(base64Data, 'base64');
		writeFileSync(filePath, buffer);

		if (devSurveyDir !== surveyDir && existsSync(devSurveyDir)) {
			try {
				writeFileSync(join(devSurveyDir, filename), buffer);
			} catch (_) {}
		}

		return {
			filename,
			url: `files/uploads/surveys/${scopeId}/${filename}`,
			path: `uploads/surveys/${scopeId}/${filename}`,
		};
	}

	getSurveyScanStream(
		scopeId: string,
		name: string,
		res: Response,
	): StreamableFile {
		const filePath = join(this.getUploadDir(), 'surveys', scopeId, name);
		if (existsSync(filePath)) {
			res.set({
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="${name}"`,
			});
			const fileStream = createReadStream(filePath);
			return new StreamableFile(fileStream);
		}

		const fallbackPath = join(
			process.cwd(),
			'uploads',
			'surveys',
			scopeId,
			name,
		);
		if (existsSync(fallbackPath)) {
			res.set({
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="${name}"`,
			});
			const fileStream = createReadStream(fallbackPath);
			return new StreamableFile(fileStream);
		}

		throw new NotFoundException(
			`El archivo ${name} no existe para la encuesta ${scopeId}`,
		);
	}

	getTestScanStream(
		quizId: string,
		name: string,
		res: Response,
	): StreamableFile {
		const filePath = join(this.getUploadDir(), 'test', quizId, name);
		if (existsSync(filePath)) {
			res.set({
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="${name}"`,
			});
			const fileStream = createReadStream(filePath);
			return new StreamableFile(fileStream);
		}

		const fallbackPath = join(process.cwd(), 'uploads', 'test', quizId, name);
		if (existsSync(fallbackPath)) {
			res.set({
				'Content-Type': 'image/png',
				'Content-Disposition': `inline; filename="${name}"`,
			});
			const fileStream = createReadStream(fallbackPath);
			return new StreamableFile(fileStream);
		}

		throw new NotFoundException(
			`El archivo ${name} no existe para el cuestionario ${quizId}`,
		);
	}
}
