// import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
// import { redisStore } from 'cache-manager-ioredis-store';
import * as winston from 'winston';
import { ProductModule } from './product/product.module';
import databaseConfig from './shared/config/database.config';
import swaggerConfig from './shared/config/swagger.config';
import appConfig from './shared/config/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import loggingConfig from './shared/config/logging.config';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, loggingConfig, swaggerConfig, databaseConfig],
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
    // CacheModule.registerAsync({
    //   inject: [ConfigService],
    //   isGlobal: true,
    //   useFactory: async (configService: ConfigService) => ({
    //     store: async () =>
    //       await redisStore({
    //         host: configService.get('cache.host'),
    //         port: configService.get('cache.port'),
    //         password: configService.get('cache.password'),
    //         ttl: configService.get('cache.ttl'),
    //         keyPrefix: configService.get('cache.prefix'),
    //         username: configService.get('cache.username')
    //           ? configService.get('cache.username')
    //           : undefined,
    //       }),
    //   }),
    // }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...configService.get('database'),
      }),
    }),
    SharedModule,
    UserModule,
    ProductModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
