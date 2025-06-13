import { Module } from '@nestjs/common';
import { UserValidationController } from '../messaging/user-validation.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UserValidationController],
  providers: [
    UsersService,
    PrismaService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: UserRepository,
      useClass: UserRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
