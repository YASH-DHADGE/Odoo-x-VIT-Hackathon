'use client';

import * as React from 'react';
import { useTemplates, useCreateTemplate } from '@/hooks/useApprovals';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  Plus, 
  Settings2, 
  Workflow, 
  Zap, 
  ChevronRight, 
  Layers, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SettingsTemplatesPage() {
  const { data: templates, isLoading } = useTemplates();
  const createMutation = useCreateTemplate();
  
  const [name, setName] = React.useState('');
  const [isDefault, setIsDefault] = React.useState(false);

  if (isLoading) return (
    <div className="space-y-8 max-w-5xl mx-auto">
       <div className="h-32 w-full glass-panel rounded-[32px] animate-pulse" />
       <div className="h-48 w-full glass-panel rounded-3xl animate-pulse" />
       <div className="space-y-4">
          {[1,2].map(i => <div key={i} className="h-40 glass-panel rounded-2xl animate-pulse" />)}
       </div>
    </div>
  );

  const handleCreate = () => {
    if (!name) return toast.error('Identity required for new protocol');
    createMutation.mutate({ name, isDefault }, {
       onSuccess: () => {
         setName('');
         setIsDefault(false);
         toast.success('Approval protocol initialized');
       }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header Panel */}
      <div className="relative overflow-hidden p-8 lg:p-10 glass-panel rounded-[40px] border border-white/10 group">
         <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Settings2 className="size-48 rotate-45" />
         </div>
         
         <div className="space-y-3 relative z-10">
            <h1 className="text-4xl font-heading font-bold tracking-tight">
               Approval <span className="text-primary italic">Engine</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed font-medium">
               Architect modular reimbursement workflows. Define multi-step verification gates to ensure compliance across your global workspace.
            </p>
         </div>

         <div className="flex items-center gap-6 mt-6 relative z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest">
               <Zap className="size-3" /> System Active
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest font-mono">
               Ver {templates?.length || 0}.0.1
            </div>
         </div>
      </div>

      {/* Laboratory Section (Creation) */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="p-8 glass-panel rounded-[32px] border border-white/10 space-y-6 relative group overflow-hidden">
               <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                     <Plus className="size-5" />
                  </div>
                  <div>
                     <h3 className="font-heading font-bold text-lg">Initialize Protocol</h3>
                     <p className="text-xs text-muted-foreground font-medium">Draft a new sequence for expense routing.</p>
                  </div>
               </div>

               <div className="grid gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Protocol Handle</label>
                     <Input 
                       value={name} 
                       onChange={(e) => setName(e.target.value)} 
                       placeholder="e.g. Executive Travel Matrix" 
                       className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg placeholder:text-muted-foreground/30"
                     />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                     <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
                           <AlertCircle className="size-4" />
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-sm">Default Fallback</p>
                           <p className="text-[10px] text-muted-foreground truncate font-medium">Automatically apply to expenses without specific traits.</p>
                        </div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={isDefault} 
                          onChange={(e) => setIsDefault(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border border-white/10 transition-colors" />
                     </label>
                  </div>
               </div>

               <Button 
                 onClick={handleCreate} 
                 disabled={createMutation.isPending}
                 className="w-full h-14 rounded-2xl btn-gradient font-bold text-base shadow-xl group/btn overflow-hidden relative"
               >
                 <span className="relative z-10 flex items-center gap-2">
                   {createMutation.isPending ? "Configuring Matrix..." : "Register Protocol"}
                   <ChevronRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                 </span>
               </Button>
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-8 glass-panel rounded-[32px] border border-white/5 h-full flex flex-col justify-center gap-4 relative overflow-hidden">
               <div className="absolute -top-12 -right-12 size-48 bg-primary/5 blur-3xl rounded-full" />
               <Info className="size-8 text-primary mb-2" />
               <h4 className="font-heading font-bold text-lg">How it works</h4>
               <div className="space-y-4 text-xs text-muted-foreground font-medium leading-relaxed">
                  <p>1. Define a descriptive handle for your workflow.</p>
                  <p>2. Set a global fallback for consistent compliance coverage.</p>
                  <p>3. Append verification steps with designated stakeholders.</p>
                  <p>4. The engine executes sequentially based on priority.</p>
               </div>
            </div>
         </div>
      </div>

      {/* Protocol Registry (List) */}
      <div className="space-y-6">
         <div className="flex items-center gap-3 px-2">
            <Workflow className="size-5 text-primary" />
            <h2 className="font-heading font-bold text-xl uppercase tracking-tighter">Active Protocols</h2>
            <div className="h-px bg-white/5 flex-1 ml-4" />
         </div>

         <div className="grid gap-6">
            {templates?.map((t: any, index: number) => (
               <div 
                 key={t.id} 
                 className="animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden relative group p-8 glass-panel rounded-[32px] border border-white/10 hover:bg-white/[0.04] transition-all"
                 style={{ animationDelay: `${index * 100}ms` }}
               >
                  {t.isDefault && (
                    <div className="absolute top-0 right-10 -translate-y-1/2 p-4">
                       <div className="bg-primary/20 backdrop-blur-xl text-primary text-[10px] px-4 py-1.5 rounded-full border border-primary/30 font-bold uppercase tracking-[0.2em] shadow-lg">
                          Global Default
                       </div>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                     <div className="space-y-2 max-w-xs">
                        <div className="flex items-center gap-3">
                           <div className="size-4 rounded-full bg-white/20 border border-white/20 flex items-center justify-center p-0.5">
                              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                           </div>
                           <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-7">Protocol Hash: {t.id.slice(0, 8)}</p>
                     </div>

                     <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 md:justify-end">
                           {t.steps?.length === 0 ? (
                              <div className="flex-1 max-w-md bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-4 flex items-center justify-between group/add">
                                 <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic ml-2">No verification gates defined</p>
                                 <Button variant="ghost" size="sm" className="h-8 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                                    <Plus className="size-3 mr-1.5" /> Initialize Gate
                                 </Button>
                              </div>
                           ) : (
                              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
                                 {t.steps?.map((step: any, idx: number) => (
                                    <React.Fragment key={step.id}>
                                      <div className="flex flex-col items-center gap-2 group/step">
                                         <div className="bg-white/5 min-w-[140px] px-4 py-3 rounded-2xl border border-white/5 shadow-inner transition-all group-hover/step:bg-white/[0.08] group-hover/step:border-white/10">
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mb-1">Step 0{step.stepOrder}</p>
                                            <p className="text-xs font-bold text-foreground truncate">{step.approver?.name || 'Authorized Lead'}</p>
                                         </div>
                                      </div>
                                      {idx < t.steps.length - 1 && (
                                         <div className="size-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-muted-foreground/30">
                                            <ChevronRight className="size-4" />
                                         </div>
                                      )}
                                    </React.Fragment>
                                 ))}
                                 <Button variant="ghost" size="icon" className="size-10 rounded-2xl bg-white/10 border border-white/10 hover:bg-primary/20 hover:text-primary transition-all ml-2">
                                    <Plus className="size-4" />
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
