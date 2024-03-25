import { CurrencyCode } from "@prisma/client";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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