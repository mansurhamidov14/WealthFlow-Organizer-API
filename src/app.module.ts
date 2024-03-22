import { AuthModule } from '@app/auth/auth.module';
import { ClientModule } from '@app/client/client.module';
import { CurrencyModule } from '@app/currency/currency.module';
import { HttpModule } from '@app/http/http.module';
import { PrismaModule } from '@app/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    HttpModule,
    ClientModule,
    CurrencyModule,
    PrismaModule
  ],
})
export class AppModule {}