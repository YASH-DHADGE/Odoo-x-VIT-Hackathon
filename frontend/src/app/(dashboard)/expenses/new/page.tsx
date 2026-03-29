'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreateExpense } from '@/hooks/useExpenses';
import { ExpenseForm } from '@/components/forms/expense-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function NewExpensePage() {
  const router = useRouter();
  const createMutation = useCreateExpense();

  const handleSubmit = (values: any) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        router.push('/expenses');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Navigation & Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          asChild 
          className="w-fit -ml-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl group"
        >
          <Link href="/expenses" className="flex items-center gap-2">
            <ChevronLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to Activity
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-heading font-bold tracking-tight text-foreground">
               Draft <span className="text-primary italic">Statement</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
               Initialize a new reimbursement request. All submissions are encrypted and audited for compliance.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
             <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Session Secured</span>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="relative">
         {/* Background Glows */}
         <div className="absolute -top-24 -left-24 size-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute -bottom-24 -right-24 size-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

         <div className="relative glass-panel rounded-[40px] p-8 md:p-12 border border-white/10 shadow-2xl">
            <ExpenseForm 
              onSubmit={handleSubmit} 
              isLoading={createMutation.isPending} 
            />
         </div>
      </div>

      {/* Footer Info / Compliance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: ShieldCheck, title: "Policy Guard", desc: "Automated compliance check" },
           { icon: Zap, title: "Swift Cycle", desc: "Average 48h approval time" },
           { icon: Sparkles, title: "Smart Audit", desc: "AI-powered receipt scanning" }
         ].map((item, i) => (
           <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04]">
              <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                 <item.icon className="size-5" />
              </div>
              <div>
                 <p className="text-xs font-bold text-foreground">{item.title}</p>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{item.desc}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}

