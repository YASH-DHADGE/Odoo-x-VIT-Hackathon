'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseStats } from '@/hooks/useExpenses';
import { SkeletonCard } from '@/components/shared/skeleton';
import { Banknote, CheckCircle, ClipboardList, Clock, ArrowRight, ShieldCheck, BarChart3, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function ManagerDashboard() {
  const { data: stats, isLoading } = useExpenseStats();

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
               <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Manager <span className="text-indigo-400 italic">Control</span></h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Review team submissions, monitor active spending, and enforce company reimbursement policies.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-white/5 bg-white/5 hover:bg-white/10 transition-all font-bold text-xs uppercase tracking-wider" asChild>
            <Link href="/expenses" className="flex items-center gap-2">
              <Users className="size-3.5" />
              Team Activity
            </Link>
          </Button>
          <Button className="rounded-xl h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/20" asChild>
            <Link href="/approvals" className="flex items-center gap-2">
              <ClipboardList className="size-3.5" />
              Approval Queue
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-card border-white/5 group relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] size-32 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-indigo-400 transition-colors">
              <BarChart3 className="size-3" />
              Company Throughput
            </div>
            <CardTitle className="text-sm font-medium pt-1">Total Approved Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold tracking-tight">
              ${parseFloat(String(stats?.totalApprovedAmount || 0)).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none uppercase tracking-tighter">
               Total reconciled assets (Lifetime)
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 relative bg-amber-500/[0.02] border-amber-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-500">
              <Clock className="size-3" />
              Queue Status
            </div>
            <CardTitle className="text-sm font-medium pt-1">Needs Your Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold tracking-tight text-amber-500">
               {stats?.pending ?? 0}
            </div>
            <div className="flex items-center justify-between mt-3 underline-offset-4">
               <span className="text-[10px] text-muted-foreground font-medium uppercase">Active company-wide</span>
               <Link href="/approvals" className="text-[10px] text-amber-500 font-bold hover:underline flex items-center gap-1 shrink-0">
                  Open Queue <ArrowRight className="size-2.5" />
               </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 bg-emerald-500/[0.02] border-emerald-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              <CheckCircle className="size-3" />
              Closure Rate
            </div>
            <CardTitle className="text-sm font-medium pt-1">Reconciled Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold tracking-tight text-emerald-500">
               {stats?.approved ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none uppercase tracking-tighter">
               Company-wide historical count
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Insight Section */}
      <div className="rounded-[32px] p-10 bg-white/[0.02] border border-white/5 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <ClipboardList className="size-32" />
         </div>
         <div className="max-w-xl space-y-4">
            <h2 className="text-2xl font-heading font-bold tracking-tight">Manager <span className="text-primary italic">Toolkit</span></h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
               As a manager, you have the authority to approve or reject expenses company-wide. 
               Please ensure all documentation is verified according to the **Fiscal Year 2024** compliance standards.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
               <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Policy: Standard</span>
               </div>
               <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                  <div className="size-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Hierarchy: Level 1</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

