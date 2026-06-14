'use client';

import { useEffect, useState } from 'react';
import { Activity, ShieldAlert, ArrowUpRight, TrendingUp, HelpCircle } from 'lucide-react';
import { getPortfolioHealth, PortfolioHealthData } from '@/actions/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function PortfolioHealthCenter() {
  const [data, setData] = useState<PortfolioHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPortfolioHealth();
        setData(res);
      } catch (e) {
        console.error('Failed to load portfolio health:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const health = data || { healthScore: 78, writeOffRiskIndex: 22, predictedRecovery: 685000 };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Portfolio Health Score */}
      <div className="rounded-lg border border-border/40 bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Portfolio Health</span>
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">{health.healthScore}%</span>
          <span className="text-xs text-green-500 font-medium flex items-center">
            Optimal <ArrowUpRight className="h-3 w-3 ml-0.5" />
          </span>
        </div>
        <div className="space-y-1">
          <Progress value={health.healthScore} className="h-1.5 bg-muted/60" />
          <p className="text-[10px] text-muted-foreground">Weighted collection probability index</p>
        </div>
      </div>

      {/* Write-off Risk Index */}
      <div className="rounded-lg border border-border/40 bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            Write-Off Risk
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="text-xs max-w-xs">
                  Exposure ratio of outstanding accounts nearing write-off status based on aging.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
          <ShieldAlert className={`h-4 w-4 ${health.writeOffRiskIndex > 30 ? 'text-red-500' : 'text-amber-500'}`} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">{health.writeOffRiskIndex}%</span>
          <span className="text-xs text-amber-500 font-medium">
            Managed risk
          </span>
        </div>
        <div className="space-y-1">
          <Progress value={health.writeOffRiskIndex} className="h-1.5 bg-muted/60" />
          <p className="text-[10px] text-muted-foreground">Exposure ratio of overdue assets</p>
        </div>
      </div>

      {/* Forecasted Collections */}
      <div className="rounded-lg border border-border/40 bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Forecasted Return</span>
          <TrendingUp className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight">
            ${health.predictedRecovery.toLocaleString()}
          </span>
          <span className="text-xs text-emerald-500 font-medium">
            Current Cycle
          </span>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground">Expected yield from active portfolio</p>
        </div>
      </div>
    </div>
  );
}
