import { Injectable } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class FilesService {
	private readonly uploadPath = './uploads';

	createMulterOptions(): MulterModuleOptions {
		return {
			storage: diskStorage({
				destination: this.uploadPath,
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
		return `files/${this.uploadPath.replace('./', '')}/${filename}`;
	}

	async deleteFile(filename: string): Promise<void> {
		const filePath = join(process.cwd(), this.uploadPath, filename);
		try {
			await unlink(filePath);
		} catch (error) {
			console.error(`Error deleting file ${filename}:`, error);
			// Depending on requirements, you might want to throw an exception here
			// throw new InternalServerErrorException(`Failed to delete file ${filename}`);
		}
	}
}
