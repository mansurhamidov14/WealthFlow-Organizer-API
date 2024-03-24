import { ClientService } from '@app/client/client.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshtrategy } from '@app/guards/refresh-token/jwt-refresh.strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, ClientService, JwtRefreshtrategy],
})
export class AuthModule { }