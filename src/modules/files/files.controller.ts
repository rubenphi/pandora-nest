import { Controller, Get, StreamableFile, Param, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller('files')
export class FilesController {
	@Get('uploads/:name')
	getFile(@Param('name') name: string): StreamableFile | string {
		if (existsSync('uploads/' + name)) { 
			const file = createReadStream(join(process.cwd(), 'uploads/' + name));
			return new StreamableFile(file);
		  } else {
			throw new NotFoundException(`El archivo llamado ${name} no existe`);
		  }
		
		

	}
}
