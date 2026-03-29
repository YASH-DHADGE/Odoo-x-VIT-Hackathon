'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/hooks/useExpenses';
import { SkeletonCard } from '@/components/shared/skeleton';
import { CheckCircle, Clock, FileText, Plus, ArrowRight, Wallet, History, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';

export function EmployeeDashboard() {
  const { user } = useAuthStore();
  const { data: pending, isLoading: loadingPending } = useExpenses({
    status: 'PENDING',
    page: 1,
    limit: 1,
  });
  const { data: approved, isLoading: loadingApproved } = useExpenses({
    status: 'APPROVED',
    page: 1,
    limit: 1,
  });
  const { data: allMine, isLoading: loadingAll } = useExpenses({
    page: 1,
    limit: 1,
  });

  const isLoading = loadingPending || loadingApproved || loadingAll;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-36 rounded-2xl bg-muted animate-pulse" />
        <div className="grid gap-5 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const pendingCount = pending?.meta?.total ?? 0;
  const approvedCount = approved?.meta?.total ?? 0;
  const totalMine = allMine?.meta?.total ?? 0;

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-8 text-primary-foreground">
        {/* Decorative background shapes */}
        <div className="absolute -top-10 -right-10 size-48 rounded-full bg-white/8" />
        <div className="absolute -bottom-10 right-20 size-32 rounded-full bg-black/8" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm text-primary-foreground/70 font-medium">Good to see you back,</p>
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {firstName} 👋
            </h1>
            <p className="text-sm text-primary-foreground/60 max-w-sm mt-1">
              You have <strong className="text-primary-foreground">{pendingCount} request{pendingCount !== 1 ? 's' : ''}</strong> awaiting approval.
            </p>
          </div>

          <Button
            asChild
            className="shrink-0 h-10 px-6 rounded-lg bg-white/20 hover:bg-white/30 text-primary-foreground border border-white/20 font-semibold text-sm backdrop-blur-sm transition-all duration-200"
          >
            <Link href="/expenses/new" className="flex items-center gap-2">
              <Plus className="size-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Total */}
        <Card className="glass-card group">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Submitted
              </CardTitle>
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                <FileText className="size-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-heading font-bold text-foreground">{totalMine}</div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">Lifetime activity</span>
              <Link
                href="/expenses"
                className="text-xs text-primary font-semibold hover:underline underline-offset-4 flex items-center gap-1"
              >
                View all <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="glass-card border-amber-200 dark:border-amber-500/20">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Pending
              </CardTitle>
              <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <Clock className="size-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-heading font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-3">Awaiting manager review</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="glass-card border-emerald-200 dark:border-emerald-500/20">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Approved
              </CardTitle>
              <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-heading font-bold text-emerald-700 dark:text-emerald-400">{approvedCount}</div>
            <p className="text-xs text-muted-foreground mt-3">Total cleared requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
          <TrendingUp className="size-3.5 text-primary" />
          Need help? Contact <span className="text-foreground font-semibold underline decoration-dotted underline-offset-2 cursor-pointer">Finance Support</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            asChild
            className="flex-1 sm:flex-none h-9 px-5 rounded-lg text-xs font-semibold border-border hover:bg-muted"
          >
            <Link href="/expenses" className="flex items-center gap-2">
              <History className="size-3.5" />
              Full History
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 sm:flex-none h-9 px-5 rounded-lg text-xs font-semibold btn-gradient"
          >
            <Link href="/expenses/new" className="flex items-center gap-2">
              <Plus className="size-3.5" />
              New Request
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
