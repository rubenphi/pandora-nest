import {
	Controller,
	Get,
	StreamableFile,
	Param,
	NotFoundException,
	Post,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

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
	getFile(@Param('name') name: string): StreamableFile {
		if (existsSync('uploads/' + name)) {
			const file = createReadStream(join(process.cwd(), 'uploads/' + name));
			return new StreamableFile(file);
		} else {
			throw new NotFoundException(`The file ${name} does not exist`);
		}
	}
}
