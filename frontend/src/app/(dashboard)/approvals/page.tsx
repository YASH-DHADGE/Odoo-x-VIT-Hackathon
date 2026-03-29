'use client';

import * as React from 'react';
import { usePendingApprovals, useApprove, useReject } from '@/hooks/useApprovals';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, User, Calendar, Tag, ExternalLink, MessageSquare, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function ApprovalsPage() {
  const { data: pendingItems, isLoading } = usePendingApprovals();
  const approveMutation = useApprove();
  const rejectMutation = useReject();

  const [selectedAction, setSelectedAction] = React.useState<{ expenseId: string, type: 'APPROVE' | 'REJECT' } | null>(null);
  const [comments, setComments] = React.useState('');

  if (isLoading) return (
    <div className="space-y-6">
       <div className="h-20 w-full glass-panel rounded-3xl animate-pulse" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 glass-card rounded-[32px] animate-pulse" />)}
       </div>
    </div>
  );

  const expenses = pendingItems || [];

  const handleAction = () => {
    if (!selectedAction) return;
    
    if (selectedAction.type === 'APPROVE') {
      approveMutation.mutate({ expenseId: selectedAction.expenseId, comments }, {
        onSuccess: () => {
          setSelectedAction(null);
          setComments('');
        }
      });
    } else {
      rejectMutation.mutate({ expenseId: selectedAction.expenseId, comments }, {
        onSuccess: () => {
          setSelectedAction(null);
          setComments('');
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Header */}
      <div className="relative group">
         <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-[32px] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 glass-panel rounded-[32px] border border-white/10">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
                    Action <span className="text-primary italic">Queue</span>
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary uppercase tracking-widest animate-pulse">
                     {expenses.length} Pending
                  </span>
               </div>
               <p className="text-muted-foreground text-sm max-w-md">
                 Review and verify reimbursement requests from your team. Accuracy is paramount for compliance.
               </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Manager Authority</span>
                  <span className="text-sm font-semibold text-foreground">Verified Session</span>
               </div>
               <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <AlertCircle className="size-6" />
               </div>
            </div>
         </div>
      </div>

      {expenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-[40px] border-dashed border-white/10 text-center">
          <div className="size-20 rounded-3xl bg-secondary/30 flex items-center justify-center mb-6">
            <CheckCircle2 className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-heading font-bold text-foreground">Perfect Synchrony</h3>
          <p className="text-muted-foreground max-w-sm mt-2">All pending requests have been processed. Your queue is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {expenses.map((e: any, index: number) => (
            <div 
              key={e.id} 
              className="glass-card group hover:scale-[1.02] transition-all duration-500 border border-white/10 flex flex-col p-6 rounded-[32px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Card Header: User Info */}
              <div className="flex items-center gap-4 mb-6">
                 <div className="size-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-white/10 text-primary font-bold shadow-inner">
                    {e.submittedBy.name.split(' ').map((n: string) => n[0]).join('')}
                 </div>
                 <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground truncate">{e.submittedBy.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">{e.submittedBy.email}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-heading font-black text-foreground">{e.currency} {parseFloat(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                       <Calendar className="size-3 text-muted-foreground" />
                       <span className="text-[10px] text-muted-foreground font-medium">{format(new Date(e.date), 'MMM dd')}</span>
                    </div>
                 </div>
              </div>

              {/* Card Body: Request Details */}
              <div className="space-y-4 flex-1">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                       <Tag className="size-3 text-primary" />
                       <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">{e.category}</span>
                    </div>
                    {e.receiptUrl && (
                      <Button variant="ghost" size="sm" asChild className="h-8 px-2 text-primary hover:bg-primary/5 rounded-lg">
                        <a href={e.receiptUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-bold uppercase">
                          Receipt <ExternalLink className="size-2.5" />
                        </a>
                      </Button>
                    )}
                 </div>

                 <div className="relative p-4 rounded-2xl bg-white/[0.03] border border-white/5 group-hover:bg-white/[0.05] transition-colors">
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                       {e.description || "No tactical details provided for this expense."}
                    </p>
                 </div>
              </div>

              {/* Card Footer: Actions */}
              <div className="flex gap-3 mt-8">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-2xl border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all group/btn"
                  onClick={() => setSelectedAction({ expenseId: e.id, type: 'REJECT' })}
                >
                  <XCircle className="size-4 mr-2 group-hover/btn:scale-110 transition-transform" /> Decline
                </Button>
                <Button 
                  variant="default" 
                  className="flex-1 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all text-xs font-bold uppercase tracking-wider"
                  onClick={() => setSelectedAction({ expenseId: e.id, type: 'APPROVE' })}
                >
                  <CheckCircle2 className="size-4 mr-2" /> Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modernized Action Dialog */}
      <Dialog open={selectedAction !== null} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-background/40 backdrop-blur-2xl border-white/10 rounded-[32px] shadow-2xl">
          <div className={cn(
             "h-2 w-full",
             selectedAction?.type === 'APPROVE' ? "bg-primary" : "bg-destructive"
          )} />
          
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-heading font-bold text-foreground">
                {selectedAction?.type === 'APPROVE' ? 'Finalize Approval' : 'Decline Request'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                 Provide optional context for your decision. This will be recorded in the audit log.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Comments</label>
                   {selectedAction?.type === 'REJECT' && (
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-widest bg-destructive/10 px-2 py-0.5 rounded-md">Required</span>
                   )}
                </div>
                <div className="relative">
                   <MessageSquare className="absolute left-4 top-4 size-4 text-muted-foreground/50" />
                   <textarea 
                     placeholder={selectedAction?.type === 'APPROVE' ? 'Great work, team! (Optional)' : 'Please clarify the business necessity of this expense...'} 
                     className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-sm text-foreground focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 ring-offset-background resize-none"
                     value={comments}
                     onChange={(e) => setComments(e.target.value)}
                   />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                 <Button 
                   variant="ghost" 
                   className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest hover:bg-white/5" 
                   onClick={() => setSelectedAction(null)}
                 >
                   Discard
                 </Button>
                 <Button 
                   className={cn(
                     "flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest shadow-xl transition-all",
                     selectedAction?.type === 'APPROVE' ? "btn-gradient shadow-primary/20" : "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20"
                   )}
                   onClick={handleAction}
                   disabled={selectedAction?.type === 'REJECT' && !comments.trim()}
                 >
                   {selectedAction?.type === 'APPROVE' ? 'Execute' : 'Reject'}
                 </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


