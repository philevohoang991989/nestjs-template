import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { join } from 'path';
import { AppModule } from './app.module';
import { AppConfig } from './shared/config/app.config';
import { SwaggerConfig } from './shared/config/swagger.config';
import { HttpLoggingInterceptor } from './shared/interceptor/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    cors: true,
  });
  // Cho phép truy cập ảnh tĩnh
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: JSON.parse(
            error.constraints[Object.keys(error.constraints)[0]],
          ),
        }));

        return new BadRequestException(result);
      },
    }),
  );
  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  const shouldLogHttp = configService.get('log.http');
  if (shouldLogHttp === 'true') {
    app.useGlobalInterceptors(new HttpLoggingInterceptor());
  }

  if (appConfig.globalPrefix) {
    app.setGlobalPrefix(appConfig.globalPrefix);
  }

  const swaggerConfig = configService.get<SwaggerConfig>('swagger');
  if (swaggerConfig.enable === 'true') {
    const config = new DocumentBuilder()
      .setTitle(`${appConfig.name} API`)
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(swaggerConfig.path, app, document);
  }

  await app.listen(appConfig.port);
  const appUrl = await app.getUrl();
  Logger.log(
    `${appConfig.name} is listening at ${appUrl}`,
    NestApplication.name,
  );

  if (swaggerConfig.enable === 'true') {
    Logger.log(
      `Swagger UI is ready at ${appUrl}/${swaggerConfig.path}`,
      SwaggerModule.name,
    );
  }
}
bootstrap();
