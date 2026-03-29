import { ExpenseCategory } from '@prisma/client';
export declare class CreateExpenseDto {
    amount: number;
    currency: string;
    category: ExpenseCategory;
    description: string;
    date: string;
    receiptUrl?: string;
    ocrJobId?: string;
}
