'use client';

import * as React from 'react';
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from '@/hooks/useUsers';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  UserCog, 
  Search, 
  UserPlus, 
  Shield, 
  Briefcase, 
  User as UserIcon,
  ChevronRight,
  MoreVertical,
  Mail,
  Fingerprint
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const userSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE']),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'EMPLOYEE' },
  });

  const onSubmit = (values: UserFormValues) => {
    createMutation.mutate(values, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      },
    });
  };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const roles = ['EMPLOYEE', 'MANAGER', 'ADMIN'];
    const nextRole = roles[(roles.indexOf(currentRole) + 1) % roles.length];
    updateMutation.mutate({ id: userId, data: { role: nextRole as any } });
  };

  if (isLoading) return (
    <div className="space-y-6">
       <div className="h-24 w-full glass-panel rounded-3xl animate-pulse" />
       <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="h-20 glass-panel rounded-2xl animate-pulse" />)}
       </div>
    </div>
  );

  const filteredUsers = users?.filter((u: { name: string; email: string }) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return { label: 'Administrator', icon: Shield, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
      case 'MANAGER': return { label: 'Manager', icon: Briefcase, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' };
      default: return { label: 'Employee', icon: UserIcon, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 glass-panel rounded-[32px] border border-white/10 relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <UserCog className="size-32 rotate-12" />
         </div>
         
         <div className="space-y-2 relative z-10">
            <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
              Member <span className="text-primary italic">Directory</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              Manage identity, access control, and workspace hierarchy within the organization.
            </p>
         </div>

         <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
               <input 
                 type="text"
                 placeholder="Search members..."
                 className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 rounded-2xl btn-gradient font-bold shadow-lg shadow-primary/20">
                  <UserPlus className="size-4 mr-2" /> Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/40 backdrop-blur-2xl border-white/10 rounded-[32px] p-0 overflow-hidden max-w-lg">
                <div className="h-2 bg-primary w-full" />
                <div className="p-8 space-y-6">
                   <DialogHeader>
                     <DialogTitle className="text-2xl font-heading font-bold">New Identity</DialogTitle>
                     <DialogDescription className="text-muted-foreground">Initialize a new account in the secure workspace.</DialogDescription>
                   </DialogHeader>
                   <Form {...form}>
                     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                       <FormField
                         control={form.control}
                         name="name"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Identity</FormLabel>
                             <FormControl>
                               <div className="relative">
                                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                  <Input placeholder="Johnathan Doe" {...field} className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl" />
                               </div>
                             </FormControl>
                             <FormMessage className="text-[10px]" />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="email"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Secure Email</FormLabel>
                             <FormControl>
                               <div className="relative">
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                                  <Input type="email" placeholder="john@company.audit" {...field} className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl" />
                               </div>
                             </FormControl>
                             <FormMessage className="text-[10px]" />
                           </FormItem>
                         )}
                       />
                       <FormField
                         control={form.control}
                         name="role"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Permission Level</FormLabel>
                             <Select value={field.value} onValueChange={(val) => val && field.onChange(val)}>
                               <FormControl>
                                 <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl px-4">
                                   <SelectValue placeholder="Assign level" />
                                 </SelectTrigger>
                               </FormControl>
                               <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                                 <SelectItem value="EMPLOYEE">Standard Employee</SelectItem>
                                 <SelectItem value="MANAGER">Operational Manager</SelectItem>
                                 <SelectItem value="ADMIN">System Administrator</SelectItem>
                               </SelectContent>
                             </Select>
                             <FormMessage className="text-[10px]" />
                           </FormItem>
                         )}
                       />
                       <div className="flex justify-end pt-4">
                         <Button type="submit" className="w-full h-14 rounded-2xl btn-gradient font-bold text-base shadow-xl" disabled={createMutation.isPending}>
                           {createMutation.isPending ? "Generating..." : "Authorize Access"}
                         </Button>
                       </div>
                     </form>
                   </Form>
                </div>
              </DialogContent>
            </Dialog>
         </div>
      </div>

      {/* Modern Table Layout */}
      <div className="space-y-4">
         {filteredUsers.map((u: { id: string; name: string; email: string; role: string }, index: number) => {
            const role = getRoleBadge(u.role);
            return (
               <div 
                 key={u.id} 
                 className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 glass-panel rounded-2xl border border-white/5 transition-all hover:bg-white/[0.04] hover:border-white/10 group/row animate-in fade-in slide-in-from-left-4"
                 style={{ animationDelay: `${index * 50}ms` }}
               >
                  <div className="flex items-center gap-4 flex-1">
                     <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/10 text-primary font-bold shadow-inner">
                        {u.name.split(' ').map((n: string) => n[0]).join('')}
                     </div>
                     <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{u.name}</p>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                           <Mail className="size-3" />
                           <span className="text-[10px] uppercase font-medium tracking-tight truncate">{u.email}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-6 sm:gap-12">
                     <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border",
                        role.color
                     )}>
                        <role.icon className="size-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{role.label}</span>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-10 rounded-xl bg-white/5 border border-white/5 hover:bg-primary/20 hover:text-primary transition-all"
                          onClick={() => handleRoleChange(u.id, u.role)}
                        >
                          <UserCog className="size-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="size-10 rounded-xl bg-white/5 border border-white/5 hover:bg-destructive/20 hover:text-destructive transition-all"
                          onClick={() => {
                            if (confirm('Permanently revoke access for this user?')) {
                              deleteMutation.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                        <div className="sm:hidden lg:block">
                           <Button variant="ghost" size="icon" className="size-10 rounded-xl opacity-0 group-hover/row:opacity-100 transition-opacity">
                              <ChevronRight className="size-4 text-muted-foreground" />
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
            );
         })}
         {!filteredUsers.length && (
            <div className="flex flex-col items-center justify-center py-20 px-4 glass-panel rounded-[32px] border-dashed border-white/10">
               <Fingerprint className="size-12 text-muted-foreground/30 mb-4" />
               <p className="text-muted-foreground text-center max-w-xs">No identities found in current scope. Try adjusting your search filters.</p>
            </div>
         )}
      </div>
    </div>
  );
}


