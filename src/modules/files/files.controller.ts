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
	Body,
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

	@Get('export-storage-zip')
	@ApiOperation({ summary: 'Export complete storage folder (sqlite data + uploads) as zip stream' })
	exportStorageZip(@Res() res: Response) {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		res.set({
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="pandora_storage_${timestamp}.zip"`,
		});

		const stream = this.filesService.getStorageZipStream();
		stream.on('error', (err: any) => {
			if (!res.headersSent) {
				res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating storage zip stream');
			}
		});
		stream.pipe(res);
	}

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

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('upload/test/:quizId')
	@ApiOperation({ summary: 'Upload scanned OMR test sheet for a quiz' })
	@UseInterceptors(FileInterceptor('file'))
	async uploadTestScan(
		@Param('quizId') quizId: string,
		@UploadedFile() file?: Express.Multer.File,
		@Body() body?: any,
	) {
		return this.filesService.saveTestScan(quizId, file, body);
	}

	@Get('uploads/test/:quizId/:name')
	getTestScanFile(
		@Param('quizId') quizId: string,
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	): StreamableFile {
		return this.filesService.getTestScanStream(quizId, name, res);
	}

	@Roles(Role.Admin, Role.Director, Role.Coordinator, Role.Teacher)
	@Auth()
	@Post('upload/omr/template')
	@ApiOperation({ summary: 'Upload background image for an OMR template' })
	@UseInterceptors(FileInterceptor('file'))
	async uploadOmrTemplateBackground(
		@UploadedFile() file?: Express.Multer.File,
		@Body() body?: any,
	) {
		const identifier = body?.identifier || body?.slug || 'template';
		if (file) {
			return this.filesService.saveOmrTemplateBackground(
				identifier,
				file.buffer,
				file.originalname,
			);
		}
		if (body?.image || body?.base64) {
			return this.filesService.saveOmrTemplateBackground(
				identifier,
				body.image || body.base64,
				body?.originalName,
			);
		}
		throw new BadRequestException(
			'Debe enviar un archivo o una imagen base64.',
		);
	}

	@Get('uploads/OMR/templates/:name')
	getOmrTemplateFile(
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	): StreamableFile {
		return this.filesService.getOmrTemplateStream(name, res);
	}

	@Get('uploads/surveys/:id/:name')
	getSurveyScanFile(
		@Param('id') id: string,
		@Param('name') name: string,
		@Res({ passthrough: true }) res: Response,
	): StreamableFile {
		return this.filesService.getSurveyScanStream(id, name, res);
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
