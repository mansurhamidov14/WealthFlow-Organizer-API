import { Account, CurrencyCode } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export type AccountId = Account['id'];

export class AccountFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(CurrencyCode)
  @IsNotEmpty()
  currency: CurrencyCode;

  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsString()
  @IsOptional()
  primary: string;

  @IsString()
  @IsNotEmpty()
  skin: string;
}

export class ChangeBalanceDto {
  @IsNumber()
  @IsNotEmpty()
  difference: number;
}