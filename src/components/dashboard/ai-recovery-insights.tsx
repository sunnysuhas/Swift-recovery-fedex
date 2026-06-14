'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { getAiDashboardInsightsAction, DashboardInsightsOutput } from '@/actions/ai-actions';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function AiRecoveryInsights() {
  const [data, setData] = useState<DashboardInsightsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const insightsData = await getAiDashboardInsightsAction();
        setData(insightsData);
      } catch (err) {
        console.error('Failed to load AI insights:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
      case 'opportunity':
        return <Zap className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />;
      default:
        return <Lightbulb className="h-4 w-4 text-primary shrink-0" />;
    }
  };

  const getInsightClass = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-l-2 border-l-red-500 bg-red-500/5';
      case 'opportunity':
        return 'border-l-2 border-l-amber-500 bg-amber-500/5';
      case 'performance':
        return 'border-l-2 border-l-emerald-500 bg-emerald-500/5';
      default:
        return 'border-l-2 border-l-primary/60 bg-primary/5';
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border/40 bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground">Generating Portfolio Intelligence briefing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/40 bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-bold text-sm">AI Recovery Intelligence</h3>
        </div>
        <span className="text-[10px] font-mono tracking-wide uppercase text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
          Cognitive Analysis Active
        </span>
      </div>
      <div className="p-4 grid gap-4 md:grid-cols-3">
        {data?.insights.map((insight) => (
          <div
            key={insight.id}
            className={`flex flex-col justify-between p-4 rounded border border-border/30 shadow-none transition-all duration-150 hover:border-border/60 ${getInsightClass(
              insight.type
            )}`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-bold text-xs tracking-tight text-foreground truncate">
                    {insight.title}
                  </h4>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono font-semibold px-1.5 bg-card shrink-0">
                  {insight.metric}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {insight.description}
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-border/20 flex items-center justify-between text-[10px]">
              <span className="font-medium text-foreground">{insight.impact}</span>
              <Link
                href="/cases"
                className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors gap-0.5 font-semibold"
              >
                Go <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
