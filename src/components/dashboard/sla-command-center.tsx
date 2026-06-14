'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert, Zap, Loader2, Play, CheckCircle } from 'lucide-react';
import { getSlaBreachedCases } from '@/actions/analytics';
import { triggerRpaEscalationAction } from '@/actions/cases';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export function SlaCommandCenter() {
  const { toast } = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getSlaBreachedCases();
        setCases(data);
      } catch (e) {
        console.error('Error loading SLA cases:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const triggerEscalation = async (caseId: string) => {
    setEscalatingId(caseId);
    try {
      await triggerRpaEscalationAction(caseId);
      toast({
        title: 'RPA Escalation Dispatched',
        description: `Case ${caseId} has been successfully escalated. Agency notified.`,
      });
      // Refresh list
      const data = await getSlaBreachedCases();
      setCases(data);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Escalation Failed',
        description: 'Robot controller was unable to trigger escalation.',
      });
    } finally {
      setEscalatingId(null);
    }
  };

  if (loading) {
    return <Skeleton className="h-44 w-full" />;
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-destructive" />
          <h3 className="font-bold text-sm">SLA Breach Command Center</h3>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase font-mono">
          {cases.length} Threats Detected
        </Badge>
      </div>
      <div className="overflow-x-auto">
        {cases.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No active SLA breach threats detected. All assignments are compliant.
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="p-3 font-semibold">Case ID</th>
                <th className="p-3 font-semibold">Debtor</th>
                <th className="p-3 font-semibold">Overdue Value</th>
                <th className="p-3 font-semibold">Aging</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 text-right font-semibold">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono">
                    <Link href={`/cases/${c.id}`} className="text-primary hover:underline font-medium">
                      {c.id}
                    </Link>
                  </td>
                  <td className="p-3 font-medium text-foreground">{c.debtorName}</td>
                  <td className="p-3 font-semibold">${c.amount.toLocaleString()}</td>
                  <td className="p-3">{c.aging} days</td>
                  <td className="p-3">
                    <Badge
                      className={`text-[9px] px-1.5 py-0 font-semibold uppercase ${
                        c.slaStatus === 'Breached' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 border-amber-500/20'
                      }`}
                    >
                      {c.slaStatus}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] font-semibold border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-all duration-150"
                      onClick={() => triggerEscalation(c.id)}
                      disabled={escalatingId !== null}
                    >
                      {escalatingId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3 mr-1 fill-current" />
                      )}
                      RPA Dispatch
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
