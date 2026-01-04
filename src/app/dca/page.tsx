'use client';

import AppHeader from '@/components/layout/header';
import { CasesTable } from '@/components/cases/cases-table';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, FileText, TrendingUp, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Case, DCA } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DcaPortalPage() {
  const firestore = useFirestore();
  // In a real app, we'd get the logged-in DCA's ID from the user object.
  // For now, we'll continue to mock it for demonstration.
  const myDcaId = 'dca-2';

  const myDcaRef = useMemoFirebase(() => (firestore && myDcaId ? doc(firestore, 'dcas', myDcaId) : null), [firestore, myDcaId]);
  const { data: myDca, isLoading: dcaLoading } = useDoc<DCA>(myDcaRef);

  const myCasesQuery = useMemoFirebase(() => (firestore ? query(collection(firestore, 'cases'), where('assignedDCA', '==', myDcaId)) : null), [firestore, myDcaId]);
  const { data: myCases, isLoading: casesLoading } = useCollection<Case>(myCasesQuery);

  const allDcasQuery = useMemoFirebase(() => (firestore ? collection(firestore, 'dcas') : null), [firestore]);
  const { data: allDcas, isLoading: allDcasLoading } = useCollection<DCA>(allDcasQuery);
  
  const isLoading = dcaLoading || casesLoading || allDcasLoading;

  const atRiskCasesCount = myCases?.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached').length || 0;
  const totalDebt = myCases?.reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <main className="flex flex-1 flex-col">
      <AppHeader title={`${myDca?.name || 'DCA'} Portal`} />
      <div className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Assigned Cases"
                value={myCases?.length.toString() || '0'}
                change={`${myCases?.filter(c => c.status === 'New').length || 0} new`}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Total Debt Assigned"
                value={`$${totalDebt.toLocaleString()}`}
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
                value={atRiskCasesCount.toString()}
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
                {isLoading ? <Skeleton className="h-96 w-full" /> : <CasesTable cases={myCases || []} dcas={allDcas || []} />}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
