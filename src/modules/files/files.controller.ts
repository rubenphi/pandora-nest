import {
	Controller,
	Get,
	StreamableFile,
	Param,
	NotFoundException,
	BadRequestException,
	Post,
	UseInterceptors,
	UploadedFile,
	UploadedFiles,
	Res,
	Delete,
	HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { join, extname } from 'path';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Auth } from 'src/common/decorators';
import { Role, Roles } from '../auth/roles.decorator';
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

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('upload-multiple')
	@ApiOperation({ summary: 'Upload several images at once' })
	@ApiResponse({
		status: 201,
		description: 'Files have been successfully uploaded.',
	})
	@ApiResponse({ status: 400, description: 'No file was sent.' })
	@UseInterceptors(FilesInterceptor('files'))
	uploadFiles(
		@UploadedFiles() files: Express.Multer.File[],
	): { originalname: string; filename: string; url: string }[] {
		if (!files || files.length === 0) {
			throw new BadRequestException('Debe enviar al menos un archivo.');
		}
		return files.map((file) => ({
			originalname: file.originalname,
			filename: file.filename,
			url: this.filesService.getUploadedFileUrl(file.filename),
		}));
	}

	@Get('uploads/:name')
	getFile(
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	): StreamableFile {
		const filePath = join(this.filesService.getUploadDir(), name);
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
				case '.docx':
					contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
					contentDisposition = 'attachment';
					break;
				case '.doc':
					contentType = 'application/msword';
					contentDisposition = 'attachment';
					break;
				case '.xlsx':
					contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
					contentDisposition = 'attachment';
					break;
				case '.xls':
					contentType = 'application/vnd.ms-excel';
					contentDisposition = 'attachment';
					break;
				case '.pptx':
					contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
					contentDisposition = 'attachment';
					break;
				case '.ppt':
					contentType = 'application/vnd.ms-powerpoint';
					contentDisposition = 'attachment';
					break;
				case '.zip':
					contentType = 'application/zip';
					contentDisposition = 'attachment';
					break;
				case '.rar':
					contentType = 'application/x-rar-compressed';
					contentDisposition = 'attachment';
					break;
				case '.txt':
					contentType = 'text/plain';
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
