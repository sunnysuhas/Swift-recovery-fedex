'use client';

import { CasesTable } from '@/components/cases/cases-table';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, FileText, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { Case, DCA, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DcaPortalPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const userProfileRef = useMemoFirebase(() => (firestore && user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const myDcaId = userProfile?.dcaId;

  const myDcaRef = useMemoFirebase(() => (firestore && myDcaId ? doc(firestore, 'dcas', myDcaId) : null), [firestore, myDcaId]);
  const { data: myDca, isLoading: dcaLoading } = useDoc<DCA>(myDcaRef);

  const myCasesQuery = useMemoFirebase(
    () => (firestore && user && myDcaId ? query(collection(firestore, 'cases'), where('assignedDCA', '==', myDcaId)) : null), 
    [firestore, user, myDcaId]
  );
  const { data: myCases, isLoading: casesLoading } = useCollection<Case>(myCasesQuery);

  const allDcasQuery = useMemoFirebase(() => (firestore && user ? collection(firestore, 'dcas') : null), [firestore, user]);
  const { data: allDcas, isLoading: allDcasLoading } = useCollection<DCA>(allDcasQuery);
  
  const isLoading = dcaLoading || casesLoading || allDcasLoading || !userProfile;

  if (userProfile && userProfile.role !== 'DCA_Agent') {
    return (
        <div className="flex-1 p-4 md:p-6 space-y-6 flex items-center justify-center">
            <Card className='w-full max-w-md'>
                <CardHeader className='items-center text-center'>
                    <AlertTriangle className='w-12 h-12 text-destructive' />
                    <CardTitle>Access Denied</CardTitle>
                    <CardDescription>This portal is for DCA Agents only. Your role is: {userProfile.role}</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  const atRiskCasesCount = myCases?.filter(c => c.slaStatus === 'At Risk' || c.slaStatus === 'Breached').length || 0;
  const totalDebt = myCases?.reduce((sum, c) => sum + c.amount, 0) || 0;

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
       <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{isLoading ? <Skeleton className="h-8 w-48" /> : `${myDca?.name || 'DCA'} Portal`}</h2>
      </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Assigned Cases"
                value={isLoading ? <Skeleton className="h-6 w-12" /> : myCases?.length.toString() || '0'}
                change={isLoading ? ' ' : `${myCases?.filter(c => c.status === 'New').length || 0} new`}
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Total Debt Assigned"
                value={isLoading ? <Skeleton className="h-6 w-24" /> : `$${totalDebt.toLocaleString()}`}
                change="in active collections"
                icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="Your Recovery Rate"
                value={isLoading ? <Skeleton className="h-6 w-16" /> : `${myDca?.recoveryRate || 0}%`}
                change="All-time performance"
                icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            />
            <KpiCard
                title="At-Risk SLAs"
                value={isLoading ? <Skeleton className="h-6 w-12" /> : atRiskCasesCount.toString()}
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
  );
}
