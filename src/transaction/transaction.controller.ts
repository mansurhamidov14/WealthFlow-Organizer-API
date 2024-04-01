import { User } from '@app/decorators/user.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionFormDto } from './transaction.dto';
import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';

@UseGuards(JwtAccessGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get('list')
  getList(@User('sub') userId: string) {
    return this.transactionService.getList(userId);
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
}
