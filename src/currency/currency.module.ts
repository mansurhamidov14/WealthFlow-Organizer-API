import { ClientService } from '@app/client/client.service';
import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { JwtAccessStrategy } from '@app/guards/jwt-access/jwt-access.strategy';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService, ClientService, JwtAccessStrategy],
})
export class CurrencyModule {}
