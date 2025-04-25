import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import appConfig from './shared/config/app.config';
import databaseConfig from './shared/config/database.config';
import jwtConfig from './shared/config/jwt.config';
import loggingConfig from './shared/config/logging.config';
import swaggerConfig from './shared/config/swagger.config';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        loggingConfig,
        swaggerConfig,
        databaseConfig,
        jwtConfig,
      ],
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        level: configService.get('log.level'),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.timestamp({
                format: 'YYYY-MM-DD hh:mm:ss.SSS',
              }),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike(
                configService.get('app.name'),
                {
                  colors: true,
                  prettyPrint: true,
                },
              ),
            ),
          }),
        ],
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('database')),
      }),
    }),
    AuthModule,
    SharedModule,
    UserModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
