import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({origin: '*'});
	const swaggerOptions = new DocumentBuilder()
		.setTitle('Pandora')
		.setDescription('Api to make lessons more fun')
		.setVersion('2.0')
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, swaggerOptions);

	SwaggerModule.setup('api/docs', app, document, {
		explorer: true,
		swaggerOptions: { filter: true, displayRequestDuration: true },
		uiConfig: { tagsSorter: 'alpha' },
	});
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	await app.listen(AppModule.port);
}
bootstrap();
