import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { BusinessErrorFilter } from './common/errors/businessErrors/businessError';

const APP_PORT = process.env.APP_PORT;
const NEXT_APP_HOST = process.env.NEXT_APP_HOST;
const NEXT_APP_PORT = process.env.NEXT_APP_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });

  app.enableCors({
    credentials: true,
    origin: `http://${NEXT_APP_HOST}:${NEXT_APP_PORT}`,
  });

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
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(APP_PORT);
  Logger.log(`Server has been started at ${APP_PORT} port!`);
}

bootstrap();
