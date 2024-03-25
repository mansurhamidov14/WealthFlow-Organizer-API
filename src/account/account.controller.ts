import { User } from '@app/decorators/user.decorator';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountFormDto, ChangeBalanceDto } from './account.dto';

@UseGuards(JwtAccessGuard)
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('list')
  getList(@User('sub') userId: string) {
    return this.accountService.getList(userId);
  }

  @Post('new')
  create(@User('sub') userId: string, @Body() dto: AccountFormDto) {
    return this.accountService.create(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: string, @Param('id') id: string) {
    return this.accountService.findById(id, userId);
  }

  @Patch(':id')
  update(@User('sub') userId: string, @Param('id') id: string, @Body() dto: AccountFormDto) {
    return this.accountService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@User('sub') userId: string, @Param('id') id: string) {
    return this.accountService.delete(id, userId);
  }

  @Patch('change-balance/:id')
  changeBalance(@User('sub') userId: string, @Param('id') id: string, @Body() dto: ChangeBalanceDto) {
    return this.accountService.changeBalance(id, userId, dto.difference);
  }
}
