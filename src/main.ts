process.on('uncaughtException', (err) => {
	console.error('UNCAUGHT EXCEPTION IN BACKEND:', err);
});
process.on('unhandledRejection', (reason) => {
	console.error('UNHANDLED REJECTION IN BACKEND:', reason);
});

process.env.DB_TYPE = process.env.DB_TYPE || 'sqlite';
process.env.PORT = process.env.PORT || '3000';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.HASH_KEY = process.env.HASH_KEY || 'pandora-key-hash';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({ origin: '*' });

	// Servir frontend web estático si existe (para acceso desde otros dispositivos vía navegador)
	const wwwCandidates = [
		join(__dirname, 'www'),
		join(__dirname, '..', 'www'),
		join(process.cwd(), 'www'),
	];

	for (const www of wwwCandidates) {
		if (existsSync(www) && existsSync(join(www, 'index.html'))) {
			console.log(`[Pandora Web] Sirviendo frontend web para otros dispositivos desde: ${www}`);
			app.use(express.static(www));
			app.use((req: any, res: any, next: any) => {
				const isDocOrFile = req.path.startsWith('/api') || req.path.startsWith('/files');
				const acceptsHtml = req.headers && req.headers.accept && req.headers.accept.includes('text/html');

				// Si el navegador solicita una página HTML (navegación SPA directa o refresco),
				// devolver siempre index.html para que el router de Vue maneje la vista en el cliente.
				if (req.method === 'GET' && acceptsHtml && !isDocOrFile) {
					const indexPath = join(www, 'index.html');
					return res.sendFile(indexPath);
				}
				next();
			});
			break;
		}
	}

	const swaggerOptions = new DocumentBuilder()
		.setTitle('Pandora')
		.setDescription('Api to make lessons more fun')
		.setVersion('2.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerOptions);

	SwaggerModule.setup('api/docs', app, document, {
		explorer: true,
		swaggerOptions: { filter: true, displayRequestDuration: true, tagsSorter: 'alpha' },
	});
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	await app.listen(AppModule.port, '0.0.0.0');
	console.log(`[Pandora Backend] Servidor escuchando en http://0.0.0.0:${AppModule.port}`);
}

try {
	// Signal to Capacitor Node.js runtime that the process is ready
	require('bridge');
} catch (_) {}

bootstrap();
