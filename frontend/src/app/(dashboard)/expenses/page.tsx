'use client';

import * as React from 'react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, ArrowRight, Wallet, Clock, CheckCircle2, XCircle, Ban, History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { label: 'All Activity', value: '', icon: History },
  { label: 'Pending', value: 'PENDING', icon: Clock },
  { label: 'Approved', value: 'APPROVED', icon: CheckCircle2 },
  { label: 'Rejected', value: 'REJECTED', icon: XCircle },
];

export default function ExpensesPage() {
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const { data, isLoading } = useExpenses(statusFilter ? { status: statusFilter } : undefined);

  if (isLoading) return (
    <div className="space-y-6 pt-6 animate-pulse">
       <div className="h-12 w-48 bg-white/5 rounded-2xl" />
       <div className="h-14 w-full bg-white/5 rounded-2xl" />
       <SkeletonTable rows={8} />
    </div>
  );

  const expenses = data?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-10">
      {/* Header & Main Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Expense <span className="text-primary italic">Vault</span></h1>
          <p className="text-muted-foreground text-sm">
             Securely track and manage your professional reimbursement requests.
          </p>
        </div>
        <Button asChild className="h-12 px-8 rounded-2xl btn-gradient font-bold text-sm shadow-lg shadow-primary/20 group">
          <Link href="/expenses/new" className="flex items-center gap-2">
            <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" /> 
            New Submission
          </Link>
        </Button>
      </div>

      {/* Modern Pill Filters */}
      <div className="flex items-center justify-between gap-4 p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 w-fit max-w-full overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = statusFilter === f.value;
          return (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                isActive 
                  ? "bg-white/10 text-primary shadow-sm ring-1 ring-white/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
              )}
            >
              <Icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground/50")} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Enhanced Table UI */}
      <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.01] backdrop-blur-sm shadow-2xl">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Date</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Security/Desc</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Category</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Amount</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">Status</th>
                <th className="px-6 py-5 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {expenses.map((e: any) => (
                <tr key={e.id} className="group hover:bg-white/[0.03] transition-all duration-300">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{format(new Date(e.date), 'MMM dd')}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(e.date), 'yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 max-w-[280px]">
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                          <Wallet className="size-4" />
                       </div>
                       <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate block" title={e.description}>
                          {e.description}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 italic text-muted-foreground">{e.category}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                       <span className="font-heading font-bold text-lg text-foreground tracking-tight">
                         {parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                       <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{e.currency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Button variant="ghost" size="sm" asChild className="h-9 w-9 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-all">
                      <Link href={`/expenses/${e.id}`}>
                         <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {!expenses.length && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="size-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground/30">
                          <History className="size-8" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-muted-foreground">No historical records found</p>
                          <p className="text-xs text-muted-foreground/60">Try adjusting your filters or create your first submission.</p>
                       </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string, icon: any }> = {
    APPROVED: { color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
    REJECTED: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: XCircle },
    CANCELLED: { color: 'text-muted-foreground bg-white/5 border-white/10', icon: Ban },
    PENDING: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: Clock },
  };

  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
      config.color
    )}>
      <Icon className="size-3" />
      {status}
    </span>
  );
}


