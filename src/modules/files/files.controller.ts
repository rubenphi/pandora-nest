import {
	Controller,
	Get,
	StreamableFile,
	Param,
	NotFoundException,
	Post,
	UseInterceptors,
	UploadedFile,
	Res,
	Delete,
	HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { Response } from 'express';

@ApiTags('Files Routes')
@Controller('files')
export class FilesController {
	constructor(private readonly filesService: FilesService) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	uploadFile(@UploadedFile() file: Express.Multer.File) {
		return {
			filename: file.filename,
			url: this.filesService.getUploadedFileUrl(file.filename),
		};
	}

	@Get('uploads/:name')
	getFile(
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	): StreamableFile {
		const filePath = join(process.cwd(), 'uploads/' + name);
		if (existsSync(filePath)) {
			const fileExtension = extname(name).toLowerCase();
			let contentType = 'application/octet-stream'; // Default
			let contentDisposition = 'attachment'; // Default to download

			switch (fileExtension) {
				case '.pdf':
					contentType = 'application/pdf';
					contentDisposition = 'inline';
					break;
				case '.jpg':
				case '.jpeg':
					contentType = 'image/jpeg';
					contentDisposition = 'inline';
					break;
				case '.png':
					contentType = 'image/png';
					contentDisposition = 'inline';
					break;
				case '.gif':
					contentType = 'image/gif';
					contentDisposition = 'inline';
					break;
				case '.mp4':
					contentType = 'video/mp4';
					contentDisposition = 'inline';
					break;
				case '.webm':
					contentType = 'video/webm';
					contentDisposition = 'inline';
					break;
				case '.mp3':
					contentType = 'audio/mpeg';
					contentDisposition = 'inline';
					break;
				case '.wav':
					contentType = 'audio/wav';
					contentDisposition = 'inline';
					break;
				// Add more cases for other viewable types if needed
			}

			res.set({
				'Content-Type': contentType,
				'Content-Disposition': `${contentDisposition}; filename="${name}"`, // Use filename for download
			});

			const file = createReadStream(filePath);
			return new StreamableFile(file);
		} else {
			throw new NotFoundException(`The file ${name} does not exist`);
		}
	}

	@Delete('uploads/:name')
	async deleteFile(@Param('name') name: string, @Res() res: Response) {
		try {
			await this.filesService.deleteFile(name);
			return res.status(HttpStatus.NO_CONTENT).send();
		} catch (error) {
			throw new NotFoundException(`Failed to delete file ${name}.`);
		}
	}
}
