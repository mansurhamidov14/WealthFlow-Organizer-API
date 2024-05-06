import { JwtAccessGuard } from '@app/guards/jwt-access/jwt-access.guard';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrencyCode } from '@prisma/client';
import { CurrencyService } from './currency.service';

@UseGuards(JwtAccessGuard)
@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Get('rates/:baseCurrency/:currencies/:date')
  getCurrencyRates(
    @Param('baseCurrency') baseCurrency: CurrencyCode,
    @Param('currencies') currencies: string,
    @Param('date') date: string
  ) {
    return this.currencyService.getCurrencyRates(
      baseCurrency,
      currencies.split(',') as CurrencyCode[],
      date
    );
  }
}
