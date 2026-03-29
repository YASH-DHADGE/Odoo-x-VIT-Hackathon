'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { Building2, Globe, UserPlus, Sparkles, Command } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  companyName: z.string().min(2, { message: 'Company name is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { country: 'US' },
  });

  const onSubmit = async (data: SignupValues) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      formData.append('utm_source', searchParams.get('utm_source') || '');
      
      const response = await apiClient.post('/auth/signup', formData);
      const { user, accessToken } = response.data;
      
      document.cookie = `auth-status=true; path=/; max-age=${7 * 24 * 60 * 60}`;
      login(user, accessToken);
      toast.success('Workspace created! Welcome.');
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-accent/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 w-full max-w-[1000px] grid md:grid-cols-2 gap-0 overflow-hidden rounded-[32px] border border-white/10 shadow-2xl glass-panel">
        {/* Left Side: Branding/Identity */}
        <section className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/10 to-transparent border-r border-white/5">
          <div className="space-y-6">
             <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                   <Sparkles className="size-4" />
                </div>
                <span className="font-heading font-bold text-lg tracking-tight">Odoo x VIT</span>
             </div>
             
             <div className="space-y-4 pt-4">
                <h1 className="font-heading text-4xl font-bold leading-tight">
                   Start your <span className="text-primary italic">workspace</span> today.
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                   Deploy a centralized reimbursement command center for your entire team in minutes.
                </p>
             </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-foreground/80">
                <UserPlus className="size-4 text-primary" />
                <span>Multi-role account bootstrap</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-foreground/80">
                <Building2 className="size-4 text-primary" />
                <span>Company-level policy controls</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-foreground/80">
                <Globe className="size-4 text-primary" />
                <span>Country-aware defaults</span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold px-2">
               Verified Finance Command Center
            </p>
          </div>
        </section>

        {/* Right Side: Form */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white/[0.01]">
          <div className="mb-6 space-y-1">
            <h2 className="text-2xl font-heading font-bold tracking-tight">Create workspace</h2>
            <p className="text-muted-foreground text-xs">Set up your profile and company details.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all px-4 text-sm"
                    {...register('name')}
                  />
                  {errors.name && <p className="text-[10px] text-destructive font-medium">{errors.name.message}</p>}
               </div>
               <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Work Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all px-4 text-sm"
                    {...register('email')}
                  />
                  {errors.email && <p className="text-[10px] text-destructive font-medium">{errors.email.message}</p>}
               </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all px-4 text-sm"
                {...register('password')}
              />
              {errors.password && <p className="text-[10px] text-destructive font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="companyName" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Acme Corp"
                className="h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all px-4 text-sm"
                {...register('companyName')}
              />
              {errors.companyName && <p className="text-[10px] text-destructive font-medium">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="country" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compliance Country</Label>
              <Select onValueChange={(value) => setValue('country', value as string)} defaultValue="US">
                <SelectTrigger className="h-10 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all px-4 text-sm text-left">
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 border-white/10 backdrop-blur-xl">
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="IN">India</SelectItem>
                </SelectContent>
              </Select>
              {errors.country && <p className="text-[10px] text-destructive font-medium">{errors.country.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl btn-gradient font-bold text-sm mt-2" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deploying...
                </div>
              ) : 'Initialize Hub'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-muted-foreground">
              Already have a hub?{' '}
              <Link href="/login" className="font-bold text-primary hover:underline">
                 Authenticate
              </Link>
            </p>
          </div>
          
          <div className="mt-4 flex justify-center">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 grayscale opacity-50">
                <Command className="size-3" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Terminal V4.0.1</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}


