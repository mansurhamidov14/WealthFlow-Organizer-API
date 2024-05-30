import { NumParam } from '@app/decorators/urlparams.decorator';
import { User } from '@app/decorators/user.decorator';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { UserId } from '@app/user/user.dto';
import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AccountFormDto, ChangeBalanceDto } from './account.dto';
import { AccountService } from './account.service';

@UseGuards(JwtAccessGuard)
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('list')
  getList(@User('sub') userId: UserId) {
    return this.accountService.getList(userId);
  }

  @Post('new')
  create(@User('sub') userId: UserId, @Body() dto: AccountFormDto) {
    return this.accountService.create(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: UserId, @NumParam('id') id: number) {
    return this.accountService.findById(id, userId);
  }

  @Patch(':id')
  update(@User('sub') userId: UserId, @NumParam('id') id: number, @Body() dto: AccountFormDto) {
    return this.accountService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@User('sub') userId: UserId, @NumParam('id') id: number) {
    return this.accountService.delete(id, userId);
  }

  @Patch('change-balance/:id')
  changeBalance(@User('sub') userId: UserId, @NumParam('id') id: number, @Body() dto: ChangeBalanceDto) {
    return this.accountService.changeBalance(id, userId, dto.difference);
  }
}
