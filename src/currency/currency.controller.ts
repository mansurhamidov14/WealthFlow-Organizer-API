import { Controller, Get } from '@nestjs/common';
import { CurrencyRate } from '@prisma/client';

@Controller('currency')
export class CurrencyController {
  @Get('rates')
  getCurrencyRates() {
  }
}
