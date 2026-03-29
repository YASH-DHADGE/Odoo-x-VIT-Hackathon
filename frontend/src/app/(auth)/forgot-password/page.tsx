'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { Mail, Sparkles, ChevronLeft, CheckCircle2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setIsSent(true);
      toast.success('Recovery link dispatched.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 shadow-2xl glass-panel p-1">
        <div className="bg-white/[0.01] rounded-[31px] p-8 md:p-10">
          {isSent ? (
            <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="mx-auto size-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-bold tracking-tight">Check your inbox</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a recovery link to your email. Please follow the instructions to reset your access.
                </p>
              </div>
              <Button asChild className="w-full h-12 rounded-xl btn-gradient font-bold text-sm">
                <Link href="/login">Return to Login</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8 space-y-2 text-center md:text-left">
                <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                   <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <Sparkles className="size-4" />
                   </div>
                   <span className="font-heading font-bold text-lg">Odoo x VIT</span>
                </div>
                <h2 className="text-3xl font-heading font-bold tracking-tight">Forgot access?</h2>
                <p className="text-muted-foreground text-sm">Enter your work email and we'll send a recovery link.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all pl-11 pr-4"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl btn-gradient font-bold text-sm" disabled={isLoading}>
                  {isLoading ? 'Dispatching...' : 'Send Recovery Link'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="size-4" />
                  Back to Authentication
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


