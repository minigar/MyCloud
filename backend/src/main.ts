import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import path from 'path';
import helmet from 'helmet';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { BusinessErrorFilter } from './common/errors/businessErrors/businessError';

const APP_PORT = process.env.APP_PORT;
const NEXT_APP_HOST = process.env.NEXT_APP_HOST;
const NEXT_APP_PORT = process.env.NEXT_APP_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {});

  app.enableCors({ credentials: true, origin: true });

  app.use('/public', express.static(path.join('./uploads')));

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new BusinessErrorFilter());

  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.frameguard());
  app.use(helmet.hidePoweredBy());
  app.use(helmet.hsts());
  app.use(helmet.ieNoOpen());
  app.use(helmet.noSniff());
  app.use(helmet.referrerPolicy());
  app.use(helmet.xssFilter());

  const config = new DocumentBuilder()
    .setTitle('swagger')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(APP_PORT);
  Logger.log(`Server has been started at ${APP_PORT} port!`);
}

bootstrap();
