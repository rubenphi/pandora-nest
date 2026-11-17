import { Injectable } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
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
}
