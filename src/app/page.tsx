'use client';

import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import { PriorityCasesTable } from '@/components/dashboard/priority-cases-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { Case, RecoveryDataPoint, AgingDataPoint, DcaPerformanceDataPoint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const casesQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'cases') : null),
    [firestore, user]
  );
  const { data: cases, isLoading: casesLoading } = useCollection<Case>(casesQuery);

  const priorityCasesQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(
            collection(firestore, 'cases'),
            where('priorityScore', '>', 90),
            orderBy('priorityScore', 'desc'),
            limit(10)
          )
        : null,
    [firestore, user]
  );
  const { data: priorityCases, isLoading: priorityCasesLoading } =
    useCollection<Case>(priorityCasesQuery);

  // Mocked data for charts as we don't have historical/aggregated collections yet
  const recoveryData: RecoveryDataPoint[] = [
    { month: 'Jan', rate: 65 }, { month: 'Feb', rate: 68 }, { month: 'Mar', rate: 70 },
    { month: 'Apr', rate: 72 }, { month: 'May', rate: 69 }, { month: 'Jun', rate: 71 },
  ];
  const agingData: AgingDataPoint[] = [
    { range: '0-30 Days', value: 150000 }, { range: '31-60 Days', value: 250000 },
    { range: '61-90 Days', value: 450000 }, { range: '91-120 Days', value: 300000 },
    { range: '>120 Days', value: 800000 },
  ];
  const dcaPerformance: DcaPerformanceDataPoint[] = [
    { name: 'Global Recovery', 'Recovery Rate': 78 },
    { name: 'Credit Solutions', 'Recovery Rate': 85 },
    { name: 'Apex Financial', 'Recovery Rate': 72 },
    { name: 'National Debt', 'Recovery Rate': 65 },
  ];

  const totalOutstanding = cases ? cases.reduce((sum, c) => sum + c.amount, 0) : 0;
  const activeCases = cases ? cases.length : 0;

  const isLoading = casesLoading || isUserLoading;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Outstanding Debt"
          value={isLoading ? <Skeleton className="h-6 w-32" /> : `$${totalOutstanding.toLocaleString()}`}
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
          value={isLoading ? <Skeleton className="h-6 w-16" /> : activeCases.toString()}
          change={isLoading ? ' ' : `${cases?.filter((c) => c.status === 'New').length || 0} new`}
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
            {priorityCasesLoading || isUserLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <PriorityCasesTable cases={priorityCases || []} />
            )}
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
    </div>
  );
}
