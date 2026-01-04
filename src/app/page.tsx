import {
  DollarSign,
  Users,
  TrendingUp,
  LineChart,
  Wallet,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import { PriorityCasesTable } from '@/components/dashboard/priority-cases-table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getAgingData, getDcaPerformance, getPriorityCases, getRecoveryData } from '@/lib/mock-data';
import AppHeader from '@/components/layout/header';

export default function DashboardPage() {
  const recoveryData = getRecoveryData();
  const agingData = getAgingData();
  const dcaPerformance = getDcaPerformance();
  const priorityCases = getPriorityCases();
  
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <AppHeader title="Admin Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Outstanding Debt"
          value="$1,234,567"
          change="+2.5% from last month"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Total Recovered"
          value="$876,543"
          change="+10.1% from last month"
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Overall Recovery Rate"
          value="71.0%"
          change="+1.2% from last month"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Active Cases"
          value="1,204"
          change="-20 from last month"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="lg:col-span-2 xl:col-span-2">
          <CardHeader>
            <CardTitle>Recovery Rate Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <RecoveryRateChart data={recoveryData} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 xl:col-span-1">
          <CardHeader>
            <CardTitle>Case Aging Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <AgingChart data={agingData} />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>High-Priority Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <PriorityCasesTable cases={priorityCases} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DCA Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DcaPerformanceChart data={dcaPerformance} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
