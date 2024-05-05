import { TransactionType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransactionFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  date: string;
}

export type QueryFilter = {
  fromDate?: string;
  toDate?: string;
  category?: string;
  take?: number;
  skip?: number;
}