'use client';

import { KpiCard } from '@/components/dashboard/kpi-card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DcaPerformanceDataPoint,
  RecoveryDataPoint,
  AgingDataPoint,
} from '@/lib/types';
import {
  DollarSign,
  TrendingUp,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ReportsPage() {
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

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Reporting & Analytics</h2>
        </div>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Download detailed reports for offline analysis.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select defaultValue="monthly-summary">
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select a report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly-summary">
                    Monthly Recovery Summary
                  </SelectItem>
                  <SelectItem value="dca-performance">
                    DCA Performance Review
                  </SelectItem>
                  <SelectItem value="aging-analysis">
                    Detailed Aging Analysis
                  </SelectItem>
                  <SelectItem value="full-case-export">
                    Full Case Export (CSV)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Avg. Time to Recovery"
            value="82 days"
            change="-5% from last month"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
          <KpiCard
            title="Total Recovered (QTD)"
            value="$451,234"
            change="Quarter-to-date"
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
          <KpiCard
            title="Top Performing DCA"
            value="Credit Solutions"
            change="85% recovery rate"
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <KpiCard
            title="Cases Closed (Month)"
            value="215"
            change="+15 from last month"
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recovery Rate Over Time</CardTitle>
              <CardDescription>
                Monthly recovery rate across all agencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecoveryRateChart data={recoveryData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Case Aging Distribution</CardTitle>
              <CardDescription>
                Total debt value by aging bucket.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgingChart data={agingData} />
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>DCA Performance Leaderboard</CardTitle>
            <CardDescription>
              Comparing recovery rates of all active DCAs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DcaPerformanceChart data={dcaPerformance} />
          </CardContent>
        </Card>
      </div>
  );
}
