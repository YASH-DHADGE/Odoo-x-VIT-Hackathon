'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { CheckCircle2, ShieldCheck, WalletCards, Receipt, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const login = useAuthStore((state) => state.login);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', data);
      const { user, accessToken } = response.data;

      document.cookie = `auth-status=true; path=/; max-age=${7 * 24 * 60 * 60}`;
      login(user, accessToken);
      toast.success('Welcome back!');
      router.push(callbackUrl);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex bg-background">
      {/* Theme toggle top-right */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-col w-[420px] shrink-0 bg-primary p-10 text-primary-foreground relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 size-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-black/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-white/[0.03]" />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 mb-auto">
          <div className="size-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Receipt className="size-4.5" />
          </div>
          <div>
            <p className="font-heading font-bold text-base leading-none">Finance Hub</p>
            <p className="text-[10px] text-white/60 font-medium tracking-widest uppercase mt-0.5">Odoo × VIT</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative my-auto space-y-5">
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Expense management,<br />
            <span className="text-white/70">done right.</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Submit, track, and get reimbursed — fast. Built for teams that move quickly.
          </p>

          {/* Feature list */}
          <div className="pt-4 space-y-3">
            {[
              { icon: CheckCircle2, label: 'Instant approval routing' },
              { icon: WalletCards, label: 'Multi-currency support' },
              { icon: ShieldCheck, label: 'Role-based access control' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-white/80">
                <div className="size-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Icon className="size-3.5" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-white/40 font-medium">
          © 2025 Odoo × VIT Hackathon
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Receipt className="size-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold">Finance Hub</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              Sign in
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5">
              Enter your credentials to access the platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                className="h-11 bg-background border-input rounded-lg px-4 focus-visible:ring-primary/30 transition-shadow"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-medium hover:underline underline-offset-4"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-11 bg-background border-input rounded-lg px-4 pr-11 focus-visible:ring-primary/30 transition-shadow"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 rounded-lg btn-gradient font-semibold text-sm group"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline underline-offset-4">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
