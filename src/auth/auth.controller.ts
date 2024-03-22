import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto, PinDto } from './auth.dto';
import { AccessKeyGuard } from '@app/guards/access-key/access-key.guard';
import { JwtGuard } from '@app/guards/jwt/jwt.guard';
import { User } from '@app/decorators/user.decorator';

@UseGuards(AccessKeyGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  @Post('signin')
  async signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }

  @UseGuards(JwtGuard)
  @Post('validate-pin')
  async validatePin(@User('sub') userId: string, @Body() dto: PinDto) {
    return this.authService.validatePin(userId, dto.pinCode);
  }

  @UseGuards(JwtGuard)
  @Post('set-pin')
  async setPin(@User('sub') userId: string, @Body() dto: PinDto) {
    return this.authService.setPin(userId, dto.pinCode);
  }
}
