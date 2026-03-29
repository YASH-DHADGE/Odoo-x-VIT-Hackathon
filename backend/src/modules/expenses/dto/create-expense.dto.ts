import { IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @IsString()
  @IsOptional()
  ocrJobId?: string;
}
