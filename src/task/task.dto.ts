import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

class RecurringTaskDay {
  @IsNumber()
  @IsNotEmpty()
  day: number;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsOptional()
  doneAt: number;
}

export class TaskFormDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  isRecurring?: string;

  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsOptional()
  endDate: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf(dto => !dto.isRecurring || dto.isRecurring === '0')
  time: string;

  @ValidateIf(dto => dto.isRecurring && dto.isRecurring !== '0')
  @ValidateNested({ each: true })
  @Type(() => RecurringTaskDay)
  days: RecurringTaskDay[];
}

export class ToggleDoneDto {
  @IsNumber()
  @IsNotEmpty()
  doneAt: number;
}

type TaskByIdResponseBase = {
  id: string;
  title: string;
  userId: string;
}

export type OneTimeTaskResponse = TaskByIdResponseBase & {
  isRecurring: 0;
  date: string;
  time: string;
}

export type RecurringTaskResponse = TaskByIdResponseBase & {
  isRecurring: 1,
  startDate: string;
  endDate: string;
  days: RecurringTaskDay[];
}
