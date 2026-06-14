'use client';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AIExecutiveSummary } from '@/components/reports/ai-executive-summary';
import { DcaPerformanceDataPoint, RecoveryDataPoint, AgingDataPoint } from '@/lib/types';
import { DollarSign, TrendingUp, Clock, Download, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getCases } from '@/actions/cases';
import {
  getDashboardKpis,
  getRecoveryRateOverTime,
  getCaseAgingDistribution,
  getDcaPerformanceLeaderboard,
} from '@/actions/analytics';
import Papa from 'papaparse';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic States
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

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, recoveryRes, agingRes, dcaRes] = await Promise.all([
          getDashboardKpis(),
          getRecoveryRateOverTime(),
          getCaseAgingDistribution(),
          getDcaPerformanceLeaderboard(),
        ]);
        setKpis(kpiRes);
        setRecoveryData(recoveryRes);
        setAgingData(agingRes);
        setDcaPerformance(dcaRes);
      } catch (err) {
        console.error('Failed to load reports data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const data = await getCases();

      if (data.length === 0) {
        toast({
          title: 'No Data',
          description: 'No cases found to export.',
        });
        setIsDownloading(false);
        return;
      }

      const flattenedData = data.map((item: any) => ({
        ...item,
        debtorName: item.debtor?.name || item.debtorName,
        debtorAccountId: item.debtor?.accountId || item.debtorAccountId,
        debtor: undefined,
      }));

      const csv = Papa.unparse(flattenedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'cases_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Case data has been downloaded.',
      });
    } catch (error) {
      console.error('Export failed', error);
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: 'Could not export data.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-8 space-y-6 bg-slate-50/20 dark:bg-background min-h-screen">
      <div className="flex items-center justify-between border-b border-border/20 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Executive Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            C-suite recovery projections and partner leaderboards
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Card */}
        <Card className="lg:col-span-1 shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">Export Data</CardTitle>
            <CardDescription className="text-xs">Download detailed recovery parameters for offline auditing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Report Format</label>
              <Select defaultValue="full-case-export">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-case-export">Full Case Export (CSV)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Export Portfolio'}
            </Button>
          </CardContent>
        </Card>

        {/* AI summary briefing */}
        <div className="lg:col-span-2">
          <AIExecutiveSummary kpis={kpis} agingData={agingData} dcaPerformance={dcaPerformance} />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Avg. Time to Recovery"
          value="82 days"
          change="-5% from last month"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Total Recovered (QTD)"
          value={isLoading || !kpis ? <Skeleton className="h-6 w-24" /> : `$${Math.round(kpis.totalRecovered * 0.52).toLocaleString()}`}
          change="Quarter-to-date"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Top Performing DCA"
          value={isLoading || dcaPerformance.length === 0 ? <Skeleton className="h-6 w-32" /> : dcaPerformance[0]?.name || 'Apex Credit'}
          change={isLoading || dcaPerformance.length === 0 ? '' : `${dcaPerformance[0]?.['Recovery Rate']}% performance`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Cases Closed (Month)"
          value="215"
          change="+15 from last month"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">Recovery Rate Over Time</CardTitle>
            <CardDescription className="text-xs">Monthly recovery rate trends across all active partners.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? <Skeleton className="h-[280px] w-full" /> : <RecoveryRateChart data={recoveryData} />}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold">Case Aging Distribution</CardTitle>
            <CardDescription className="text-xs">Total debt volume distributed by days overdue.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? <Skeleton className="h-[280px] w-full" /> : <AgingChart data={agingData} />}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold">DCA Performance Leaderboard</CardTitle>
          <CardDescription className="text-xs">Comparing historical collections performance of active agencies.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {isLoading ? <Skeleton className="h-[280px] w-full" /> : <DcaPerformanceChart data={dcaPerformance} />}
        </CardContent>
      </Card>
    </div>
  );
}
