import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as session from 'express-session';


async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	//app.use(express.static(path.join(__dirname, '..', 'pages')));
	app.use(
	session({
		secret: 'my-secret-key',
		resave: false,
		saveUninitialized: false
	}),
	);

	await app.listen(3000);
}
bootstrap();


