
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecoveryRateChart } from '@/components/dashboard/recovery-rate-chart';
import { AgingChart } from '@/components/dashboard/aging-chart';
import { DcaPerformanceChart } from '@/components/dashboard/dca-performance-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data until we wire up aggregate API
const recoveryData = [
    { month: 'Jan', rate: 65, target: 70 },
    { month: 'Feb', rate: 68, target: 70 },
    { month: 'Mar', rate: 70, target: 70 },
    { month: 'Apr', rate: 72, target: 70 },
    { month: 'May', rate: 69, target: 72 },
    { month: 'Jun', rate: 75, target: 72 },
];

const agingData = [
    { range: '0-30 Days', value: 120000, color: '#10b981' },
    { range: '31-60 Days', value: 80000, color: '#3b82f6' },
    { range: '61-90 Days', value: 45000, color: '#f59e0b' },
    { range: '90+ Days', value: 30000, color: '#ef4444' },
];

const dcaData = [
    { name: 'Apex', 'Recovery Rate': 82, 'SLA Breach': 2 },
    { name: 'Summit', 'Recovery Rate': 75, 'SLA Breach': 5 },
    { name: 'Global', 'Recovery Rate': 68, 'SLA Breach': 1 },
    { name: 'Pinnacle', 'Recovery Rate': 88, 'SLA Breach': 0 },
];

export default function AnalyticsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">DCA Performance</TabsTrigger>
                    <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recovery Trend vs Target</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <RecoveryRateChart data={recoveryData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Debt Aging Analysis</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AgingChart data={agingData} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Agency Performance Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DcaPerformanceChart data={dcaData} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
