import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './auth.dto';
import { AccessKeyGuard } from '@app/guards/access-key/access-key.guard';

@UseGuards(AccessKeyGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('user-exist')
  userExists(@Query('email') email: string) {
    return this.authService.userExists(email);
  }

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  async signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }
}
