import { Module } from '@nestjs/common';
import { ClientModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './http/http.module';
import { CurrencyModule } from './currency/currency.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    ClientModule,
    CurrencyModule,
    PrismaModule
  ],
})
export class AppModule {}