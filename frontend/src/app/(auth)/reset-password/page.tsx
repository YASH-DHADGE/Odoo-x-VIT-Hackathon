'use client';

import { useState, Suspense } from 'react';
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
import { LockKeyhole, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error('Reset token is missing from the URL.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      setIsSuccess(true);
      toast.success('Security credentials updated.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto size-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-heading font-bold tracking-tight">Access restored</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your password has been successfully updated. You can now use your new credentials to sign in.
          </p>
        </div>
        <Button asChild className="w-full h-12 rounded-xl btn-gradient font-bold text-sm">
          <Link href="/login">Authenticate Now</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="mb-8 space-y-2 text-center md:text-left">
        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
           <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Sparkles className="size-4" />
           </div>
           <span className="font-heading font-bold text-lg">Odoo x VIT</span>
        </div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">New password</h2>
        <p className="text-muted-foreground text-sm">Secure your account with a fresh pair of credentials.</p>
      </div>

      {!token && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-4 rounded-xl mb-4">
          <ShieldAlert className="size-4 shrink-0" />
          <span>Invalid or expired security token. Please request a new link.</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">New Password</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all pl-11 pr-4"
              {...register('newPassword')}
            />
          </div>
          {errors.newPassword && (
            <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Confirm Identity</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all pl-11 pr-4"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl btn-gradient font-bold text-sm" disabled={isLoading || !token}>
        {isLoading ? 'Updating Vault...' : 'Reset Security Credentials'}
      </Button>

      <div className="text-center">
         <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
           Return to login
         </Link>
      </div>
    </form>
  );
}

const LoadingFallback = () => (
   <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Security...</p>
   </div>
);

export default function ResetPasswordPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 shadow-2xl glass-panel p-1">
        <div className="bg-white/[0.01] rounded-[31px] p-8 md:p-10">
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}



