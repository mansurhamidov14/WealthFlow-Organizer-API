import { AccountModule } from '@app/account/account.module';
import { AuthModule } from '@app/auth/auth.module';
import { ClientModule } from '@app/client/client.module';
import { CurrencyModule } from '@app/currency/currency.module';
import { HttpModule } from '@app/http/http.module';
import { PrismaModule } from '@app/prisma/prisma.module';
import { TaskModule } from '@app/task/task.module';
import { TransactionModule } from '@app/transaction/transaction.module';
import { UserModule } from '@app/user/user.module';
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
    PrismaModule,
    UserModule,
    AccountModule,
    TransactionModule,
    TaskModule
  ]
})
export class AppModule {}