import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtAccessStrategy } from '@app/guards/jwt-access/jwt-access.strategy';

@Module({
  providers: [UserService, JwtAccessStrategy],
  controllers: [UserController]
})
export class UserModule {}
