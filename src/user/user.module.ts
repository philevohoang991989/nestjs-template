import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mail/mail.module';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { UserRoles } from './entities/userRole.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRoles, Role]),
    ConfigModule,
    JwtModule.register({
      secret:
        '204dc44273949a5ca0595af8f654b964a3d2037a727e6f52390b1f20c7604be7',
      signOptions: { expiresIn: '10m' }, // Temporary for testing. Revert to 48h for production
      // signOptions: { expiresIn: '48h' },
    }),
    MailModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule, UserModule],
})
export class UserModule {}
