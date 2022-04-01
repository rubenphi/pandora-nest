import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';

@Catch(HttpException)
export class DeleteFileException implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();
		const status = exception.getStatus();
		console.log({
			status,
			exception: exception.message,
			res: exception.getResponse(),
			req: request.file,
		});
		fs.unlinkSync(request.file.path);
		response.status(status).json({
			status,
			exception: exception.message,
			res: exception.getResponse(),
		});
	}
}
