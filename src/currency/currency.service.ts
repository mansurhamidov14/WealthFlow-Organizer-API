import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CurrencyCode, CurrencyRate } from '@prisma/client';
import { ALL_AVAILABLE_CURRENCIES } from './currency.constants';

@Injectable()
export class CurrencyService {
  constructor(private prisma: PrismaService, private httpClient: HttpService) {}

  async getCurrencyRates(base: CurrencyCode, currencies: CurrencyCode[], date: string) {
    const cached = await this.findCached(base, currencies, date);
    if (cached.length) {
      return cached;
    }
    const convertedCurrencies = ALL_AVAILABLE_CURRENCIES.filter(code => code !== base).join(',');
    const { data: { body } } = await firstValueFrom(
      this.httpClient.get(`https://www.valyuta.com/api/calculator/${base}/${convertedCurrencies}/${date}`)
    );
    const data = body.map(({ from, to, result }) => ({ from, to, result, date })) as CurrencyRate[];
    await this.prisma.currencyRate.createMany({ data });
    return data.filter(rate => currencies.includes(rate.to));
  }

  private findCached(base: CurrencyCode, currencies: CurrencyCode[], date: string) {
    return this.prisma.currencyRate.findMany({
      where: {
        date,
        from: base,
        to: {
          in: currencies
        }
      }
    })
  }
}
