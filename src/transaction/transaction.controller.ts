import { NumParam } from '@app/decorators/urlparams.decorator';
import { User } from '@app/decorators/user.decorator';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User as TUser } from '@prisma/client';
import { TransactionFormDto } from './transaction.dto';
import { TransactionService } from './transaction.service';

type UserId = TUser['id'];

@UseGuards(JwtAccessGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('list')
  getList(
    @User('sub') userId: UserId,
    @Query('startDate') fromDate?: string,
    @Query('endDate') toDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.transactionService.getList(userId, {
      fromDate,
      toDate,
      skip: Number(offset) || undefined,
      take: Number(limit) || undefined
    });
  }

  @Post('new')
  create(@User('sub') userId: UserId, @Body() dto: TransactionFormDto) {
    return this.transactionService.create(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: UserId, @NumParam('id') id: number) {
    return this.transactionService.findById(id, userId);
  }

  @Patch(':id')
  update(@User('sub') userId: UserId, @NumParam('id') id: number, @Body() dto: TransactionFormDto) {
    return this.transactionService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@User('sub') userId: UserId, @NumParam('id') id: number) {
    return this.transactionService.delete(id, userId);
  }

  @Delete('by-account/:accountId')
  deleteByAccount(@User('sub') userId: UserId, @NumParam('accountId') accountId: number) {
    return  this.transactionService.deleteByAccountId(userId, accountId);
  }
}
