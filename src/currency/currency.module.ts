import { ClientService } from '@app/client/client.service';
import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, ClientService],
})
export class CurrencyModule {}
