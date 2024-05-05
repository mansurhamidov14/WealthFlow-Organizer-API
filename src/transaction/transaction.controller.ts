import { User } from '@app/decorators/user.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionFormDto } from './transaction.dto';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';

@UseGuards(JwtAccessGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('list')
  getList(
    @User('sub') userId: string,
    @Query('from') fromDate?: string,
    @Query('to') toDate?: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    return this.transactionService.getList(userId, {
      fromDate,
      toDate,
      category,
      skip: Number(offset) || undefined,
      take: Number(limit) || undefined
    });
  }

  @Post('new')
  create(@User('sub') userId: string, @Body() dto: TransactionFormDto) {
    return this.transactionService.create(userId, dto);
  }

  @Get(':id')
  getById(@User('sub') userId: string, @Param('id') id: string) {
    return this.transactionService.findById(id, userId);
  }

  @Patch(':id')
  update(@User('sub') userId: string, @Param('id') id: string, @Body() dto: TransactionFormDto) {
    return this.transactionService.update(id, userId, dto);
  }

  @Delete(':id')
  delete(@User('sub') userId: string, @Param('id') id: string) {
    return this.transactionService.delete(id, userId);
  }

  @Delete('by-account/:accountId')
  deleteByAccount(@User('sub') userId: string, @Param('accountId') accountId: string) {
    return  this.transactionService.deleteByAccountId(userId, accountId);
  }
}
