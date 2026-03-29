'use client';

import * as React from 'react';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencySelector } from '@/components/shared/currency-selector';
import { FileUploader } from '@/components/shared/file-uploader';
import { cn } from '@/lib/utils';
import { Calendar, Tag, FileText, Banknote, CheckCircle2, X } from 'lucide-react';

const expenseSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.enum(['TRAVEL', 'FOOD', 'ACCOMMODATION', 'EQUIPMENT', 'OTHER']),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  date: z.string().min(1, 'Date is required'),
  receiptUrl: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  initialValues?: Partial<ExpenseFormValues>;
  onSubmit: (values: ExpenseFormValues) => void;
  isLoading?: boolean;
}

export function ExpenseForm({ initialValues, onSubmit, isLoading }: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema) as Resolver<ExpenseFormValues>,
    defaultValues: {
      amount: initialValues?.amount ?? 0,
      currency: initialValues?.currency ?? 'USD',
      category: (initialValues?.category as any) ?? 'OTHER',
      description: initialValues?.description ?? '',
      date: initialValues?.date ?? new Date().toISOString().split('T')[0],
      receiptUrl: initialValues?.receiptUrl ?? '',
    },
  });

  const handleUploadSuccess = (url: string) => {
    form.setValue('receiptUrl', url);
  };

  const currentReceipt = form.watch('receiptUrl');

  return (
    <Form {...form}>
      {/* @ts-ignore - Complex react-hook-form type mismatch in some versions of shadcn components */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-500">
        
        {/* Section 1: Core Details */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 <FileText className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">General Information</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Expense Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Quarterly team offsite dinner" 
                        {...field} 
                        className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all px-4"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Classification</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val: any) => field.onChange(val)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all px-4">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                        <SelectItem value="TRAVEL">Travel</SelectItem>
                        <SelectItem value="FOOD">Food</SelectItem>
                        <SelectItem value="ACCOMMODATION">Accommodation</SelectItem>
                        <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Transaction Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                        <Input 
                          type="date" 
                          {...field} 
                          className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all pl-11 pr-4"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />
           </div>
        </div>

        {/* Section 2: Financials */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <Banknote className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Financial Details</h3>
           </div>

           <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Reimbursement Amount</FormLabel>
                    <div className="flex gap-3">
                      <FormControl>
                        <div className="relative flex-1">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">$</span>
                           <Input 
                             type="number" 
                             step="0.01" 
                             {...field} 
                             className="h-14 text-lg font-heading font-bold bg-white/5 border-white/10 rounded-xl focus:ring-primary transition-all pl-10 pr-4" 
                           />
                        </div>
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field: currencyField }) => (
                          <div className="w-[120px]">
                            <CurrencySelector
                              value={currencyField.value}
                              onChange={currencyField.onChange}
                            />
                          </div>
                        )}
                      />
                    </div>
                    <FormMessage className="text-[10px] ml-1" />
                  </FormItem>
                )}
              />
           </div>
        </div>

        {/* Section 3: Documentation */}
        <div className="space-y-6">
           <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                 <Tag className="size-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Proof of Purchase</h3>
           </div>

           <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 border-dashed">
              {!currentReceipt ? (
                <FileUploader onUploadSuccess={handleUploadSuccess} />
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 animate-in zoom-in-95 duration-300">
                  <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">Receipt Captured</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">Secured in organization vault</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => form.setValue('receiptUrl', '')}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
           </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[240px] text-center sm:text-left">
              By submitting, you certify that these expenses are professional and compliant with the company policy.
           </p>
           <Button type="submit" className="w-full sm:w-auto h-14 px-10 rounded-2xl btn-gradient font-bold text-base shadow-xl shadow-primary/20 disabled:opacity-50" disabled={isLoading}>
            {isLoading ? (
               <div className="flex items-center gap-2">
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
               </div>
            ) : 'Dispatch Request'}
          </Button>
        </div>
      </form>
    </Form>
  );
}


