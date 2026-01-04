import AppHeader from '@/components/layout/header';
import { CasesTable } from '@/components/cases/cases-table';
import { getCases, getDcas } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';

export default function DcaPortalPage() {
  // In a real app, we'd get the logged-in DCA's ID. Here we'll mock it.
  const myDcaId = 'dca-2';
  const allCases = getCases();
  const allDcas = getDcas();
  const myCases = allCases.filter((c) => c.assignedDCA === myDcaId);
  const myDca = allDcas.find(d => d.id === myDcaId);

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={`${myDca?.name || 'DCA'} Portal`} />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Assigned Cases"
                value={myCases.length.toString()}
                change={`${myCases.filter(c => c.status === 'New').length} new`}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Total Debt Assigned"
                value={`$${myCases.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`}
                change="in active collections"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Your Recovery Rate"
                value={`${myDca?.recoveryRate || 0}%`}
                change="All-time performance"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="At-Risk SLAs"
                value={myCases.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached').length.toString()}
                change="Require immediate attention"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Your Assigned Cases</CardTitle>
                <CardDescription>Manage your active collection portfolio.</CardDescription>
            </CardHeader>
            <CardContent>
                <CasesTable cases={myCases} dcas={allDcas} />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
