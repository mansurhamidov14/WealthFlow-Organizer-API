import { User } from '@app/decorators/user.decorator';
import { JwtGuard } from '@app/guards/jwt/jwt.guard';
import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { User as UserType } from '@prisma/client';
import { RemovePinByPasswordDto, ResetPasswordDto, SetPinDto, ValidatePinDto } from './user.dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('')
  async getUser(@User('sub') id: string) {
    return this.userService.getById(id);
  }

  @Patch('')
  async update(@User('sub') id: string, @Body() dto: Partial<UserType>) {
    return this.userService.update(id, dto);
  }

  @Post('validate-pin')
  async validatePin(@User('sub') id: string, @Body() dto: ValidatePinDto) {
    return this.userService.validatePin(id, dto.pinCode, true);
  }

  @Post('set-pin')
  async setPin(@User('sub') userId: string, @Body() dto: SetPinDto) {
    return this.userService.setPin(userId, dto);
  }

  @Post('remove-pin-by-password')
  async removePinByPassword(@User('sub') userId: string, @Body() dto: RemovePinByPasswordDto) {
    return this.userService.removePinByPassword(userId, dto.password);
  }

  @Post('reset-password')
  async resetPassword(@User('sub') id: string, @Body() dto: ResetPasswordDto) {
    return this.userService.updatePassword(id, dto);
  }
}
