import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from '@app/guards/jwt/jwt.strategy';

@Module({
  providers: [UserService, JwtStrategy],
  controllers: [UserController]
})
export class UserModule {}
