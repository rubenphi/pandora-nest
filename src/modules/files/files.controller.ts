import {
	Controller,
	Get,
	StreamableFile,
	Param,
	NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@ApiTags('Files Routes')
@Controller('files')
export class FilesController {
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
