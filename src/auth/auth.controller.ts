import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './auth.dto';
import { ApiKeyGuard } from '@app/guards/api-key/api-key.guard';
import { JwtRefreshGuard } from '@app/guards/refresh-token/jwt-refresh.guard';
import { User } from '@app/decorators/user.decorator';

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
    @User() user: { sub: string, email: string }
  ) {
    return this.authService.refreshToken(user.sub, user.email, refreshToken);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  logout(@Headers('Authorization') refreshToken: string, @User('sub') userId: string) {
    return this.authService.deleteRefreshToken(userId, refreshToken);
  }
}
