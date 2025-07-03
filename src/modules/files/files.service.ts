import { Injectable } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
}
