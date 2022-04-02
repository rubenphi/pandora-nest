import { Controller, Get, StreamableFile, Param } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('files')
export class FilesController {
	@Get('uploads/:name')
	getFile(@Param('name') name: string): StreamableFile {
		const file = createReadStream(join(process.cwd(), 'uploads/' + name));
		return new StreamableFile(file);
	}
}
