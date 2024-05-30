import { User } from '@app/decorators/user.decorator';
import { ApiKeyGuard } from '@app/guards/api-key/api-key.guard';
import { JwtRefreshGuard } from '@app/guards/refresh-token/jwt-refresh.guard';
import { UserId } from '@app/user/user.dto';
import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { AuthDto, SignUpDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(ApiKeyGuard)
  @Get('user-exist')
  userExists(@Query('email') email: string) {
    return this.authService.userExists(email);
  }

  @UseGuards(ApiKeyGuard)
  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @UseGuards(ApiKeyGuard)
  @Post('signin')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh-token')
  refreshToken(
    @Headers('Authorization') refreshToken: string,
    @User() user: { sub: UserId, email: string }
  ) {
    return this.authService.refreshToken(user.sub, user.email, refreshToken);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  logout(@Headers('Authorization') refreshToken: string, @User('sub') userId: UserId) {
    return this.authService.deleteRefreshToken(userId, refreshToken);
  }
}
