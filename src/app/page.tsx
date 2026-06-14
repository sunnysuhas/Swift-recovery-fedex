'use client';

import { DollarSign, Users, TrendingUp, Wallet, Sparkles, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import { PriorityCasesTable } from '@/components/dashboard/priority-cases-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AiRecoveryInsights } from '@/components/dashboard/ai-recovery-insights';
import { PortfolioHealthCenter } from '@/components/dashboard/portfolio-health-center';
import { SlaCommandCenter } from '@/components/dashboard/sla-command-center';
import { getCases } from '@/actions/cases';
import {
  getDashboardKpis,
  getRecoveryRateOverTime,
  getCaseAgingDistribution,
  getDcaPerformanceLeaderboard,
} from '@/actions/analytics';
import { useUser } from '@/components/providers/local-auth-provider';
import { Case, RecoveryDataPoint, AgingDataPoint, DcaPerformanceDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user, loading: isUserLoading } = useUser();
  const [cases, setCases] = useState<Case[] | null>(null);
  const [kpis, setKpis] = useState<{
    totalOutstanding: number;
    totalRecovered: number;
    recoveryRate: number;
    activeCases: number;
    newCasesCount: number;
  } | null>(null);
  const [recoveryData, setRecoveryData] = useState<RecoveryDataPoint[]>([]);
  const [agingData, setAgingData] = useState<AgingDataPoint[]>([]);
  const [dcaPerformance, setDcaPerformance] = useState<DcaPerformanceDataPoint[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [casesData, kpisData, recoveryRateData, agingDistData, leaderboardData] = await Promise.all([
          getCases(),
          getDashboardKpis(),
          getRecoveryRateOverTime(),
          getCaseAgingDistribution(),
          getDcaPerformanceLeaderboard(),
        ]);
        setCases(casesData as unknown as Case[]);
        setKpis(kpisData);
        setRecoveryData(recoveryRateData);
        setAgingData(agingDistData);
        setDcaPerformance(leaderboardData);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setCasesLoading(false);
      }
    }
    fetchData();
  }, []);

  const priorityCases = cases
    ? cases
        .filter((c) => c.priorityScore && c.priorityScore > 90)
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 10)
    : [];

  const isLoading = casesLoading || isUserLoading;

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 min-h-screen bg-slate-50/15 dark:bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Recovery Command Center
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enterprise Recovery Intelligence Platform
          </p>
        </div>
      </div>

      {/* Health & Forecast Centers */}
      <PortfolioHealthCenter />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Outstanding Debt"
          value={isLoading || !kpis ? <Skeleton className="h-7 w-32" /> : `$${kpis.totalOutstanding.toLocaleString()}`}
          change="+2.5% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Total Recovered"
          value={isLoading || !kpis ? <Skeleton className="h-7 w-32" /> : `$${kpis.totalRecovered.toLocaleString()}`}
          change="+10.1% from last month"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Overall Recovery Rate"
          value={isLoading || !kpis ? <Skeleton className="h-7 w-20" /> : `${kpis.recoveryRate.toFixed(1)}%`}
          change="+1.2% from last month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Active Collection Cases"
          value={isLoading || !kpis ? <Skeleton className="h-7 w-16" /> : kpis.activeCases.toString()}
          change={isLoading || !kpis ? ' ' : `${kpis.newCasesCount} new cases`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* AI Insights Card Section */}
      <div className="w-full">
        <AiRecoveryInsights />
      </div>

      {/* SLA Breach Deck & Priority Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SlaCommandCenter />
        </div>
        <div className="lg:col-span-1">
          <Card className="shadow-none border-border/40">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">DCA Performance Index</CardTitle>
                <CardDescription className="text-[10px]">Ranked partner collection coefficients</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <DcaPerformanceChart data={dcaPerformance} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-none border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Recovery Volatility (6M)</CardTitle>
            <CardDescription className="text-[10px]">Monthly collections yield ratios</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? <Skeleton className="h-[260px] w-full" /> : <RecoveryRateChart data={recoveryData} />}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-1 shadow-none border-border/40">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Age Allocation Distribution</CardTitle>
            <CardDescription className="text-[10px]">Outstanding balance aging metrics</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[260px] w-full" /> : <AgingChart data={agingData} />}
          </CardContent>
        </Card>
      </div>

      {/* High-Priority Cases & Live Alerts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* High-Priority Cases (2/3) */}
        <div className="lg:col-span-2">
          <Card className="shadow-none border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-sm font-bold">Receivables Prioritization Index</CardTitle>
                <CardDescription className="text-[10px]">Accounts prioritized by score</CardDescription>
              </div>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <PriorityCasesTable cases={priorityCases} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Activity & Alerts Feed (1/3) */}
        <div className="lg:col-span-1">
          <Card className="shadow-none border-border/40 h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">System Activity & Alerts</CardTitle>
                <CardDescription className="text-[10px]">Real-time ledger events and SLA warnings</CardDescription>
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </CardHeader>
            <CardContent className="space-y-4 pt-1 text-xs">
              <div className="flex gap-2.5 items-start">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">SLA Breach Warning</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Case #case_2 exceeded SLA deadline. Auto-escalated to critical.
                  </p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">Just now</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">RPA Escalation Dispatch</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Demand briefs sent for 43 accounts near threshold limit.
                  </p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">12 mins ago</p>
                </div>
              </div>
              <div className="flex gap-2.5 items-start">
                <DollarSign className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">DCA Assignment</p>
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Case #case_102 assigned to Apex Financial Recovery.
                  </p>
                  <p className="text-muted-foreground/60 text-[9px] mt-0.5">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
