'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseStats } from '@/hooks/useExpenses';
import { SkeletonCard } from '@/components/shared/skeleton';
import { Banknote, CheckCircle, Clock, Shield, Users, Settings, ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AdminDashboard() {
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
            <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
               <Shield className="size-5" />
            </div>
            <h1 className="text-3xl font-heading font-bold tracking-tight">Admin <span className="text-primary italic">Command</span></h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Monitor organization-wide spend metrics and manage compliance policies from a single point of control.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-border bg-card hover:bg-muted transition-all font-bold text-xs uppercase tracking-wider" asChild>
            <Link href="/users" className="flex items-center gap-2">
              <Users className="size-3.5" />
              Directory
            </Link>
          </Button>
          <Button className="rounded-xl h-11 px-6 btn-gradient font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20" asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="size-3.5" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total Volume */}
        <Card className="glass-card overflow-hidden group border-border relative">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
             <Banknote className="size-20 -rotate-12" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <Activity className="size-3 text-primary" />
              Global Volume
            </div>
            <CardTitle className="text-sm font-medium pt-1">Total Approved Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-heading font-bold tracking-tight">
                ${parseFloat(String(stats?.totalApprovedAmount || 0)).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500 font-bold flex items-center gap-0.5">
                <ArrowUpRight className="size-3" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none uppercase tracking-tighter">
               Aggregated organization spend
            </p>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="glass-card overflow-hidden group border-amber-200 dark:border-amber-500/20 relative">
          <div className="absolute top-[-20%] left-[-10%] size-32 bg-amber-500/10 blur-3xl" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500">
              <Clock className="size-3" />
              Attention Required
            </div>
            <CardTitle className="text-sm font-medium pt-1">Pending company-wide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold tracking-tight text-amber-600 dark:text-amber-500">
              {stats?.pending ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none uppercase tracking-tighter">
              Awaiting manager verification
            </p>
          </CardContent>
        </Card>

        {/* Analytics Card */}
        <Card className="glass-card overflow-hidden group border-emerald-200 dark:border-emerald-500/20 relative bg-emerald-50 dark:bg-emerald-500/[0.02]">
           <div className="absolute bottom-0 right-0 p-4">
              <TrendingUp className="size-8 text-emerald-500/20" />
           </div>
           <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-500">
              <CheckCircle className="size-3" />
              Historical Throughput
            </div>
            <CardTitle className="text-sm font-medium pt-1">Approved Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold tracking-tight text-emerald-700 dark:text-emerald-500">
               {stats?.approved ?? 0}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium mt-2 leading-none uppercase tracking-tighter">
              Total reconciled tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Info Component */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="rounded-3xl p-8 bg-card border border-border shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
               <h3 className="font-heading font-bold text-xl">Policy Oversight</h3>
               <p className="text-muted-foreground text-sm leading-relaxed">
                  You are currently managing **Default Policy V2**. Spend limits are enforced at the manager level.
               </p>
            </div>
            <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
               <span>Last updated 12h ago</span>
               <Link href="/settings" className="text-primary hover:underline">Edit Rules</Link>
            </div>
         </div>
         
         <div className="rounded-3xl p-8 bg-primary/5 border border-primary/10 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
               <h3 className="font-heading font-bold text-xl text-primary">System Health</h3>
               <p className="text-primary/70 text-sm leading-relaxed">
                  Platform is operating at peak efficiency. No pending security alerts or system failures detected.
               </p>
               <div className="pt-2 flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Operational</span>
               </div>
            </div>
            <Activity className="absolute bottom-[-20px] right-[-20px] size-32 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
         </div>
      </div>
    </div>
  );
}

